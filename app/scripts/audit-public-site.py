#!/usr/bin/env python3
"""Audit public SSR routes, metadata, local media and fragment destinations.

This is a structural release check, not a substitute for browser visual QA.
Usage: python3 scripts/audit-public-site.py http://localhost:8788 --report /tmp/site-qa.json
"""
import argparse
from concurrent.futures import ThreadPoolExecutor
from html.parser import HTMLParser
import json
from urllib.parse import urljoin, urlsplit, unquote
from urllib.request import Request, urlopen
import xml.etree.ElementTree as ET

VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}


class Document(HTMLParser):
    def __init__(self, html):
        super().__init__(convert_charrefs=True)
        self.stack, self.ids, self.duplicates = [], set(), []
        self.links, self.assets, self.copy = [], set(), []
        self.title, self.description, self.canonical = "", "", ""
        self.carousels = []
        self.feed(html)

    def handle_starttag(self, tag, pairs):
        attrs = dict(pairs)
        if attrs.get("id"):
            if attrs["id"] in self.ids:
                self.duplicates.append(attrs["id"])
            self.ids.add(attrs["id"])
        if tag == "meta" and attrs.get("name") == "description":
            self.description = attrs.get("content", "")
        if tag == "link" and attrs.get("rel") == "canonical":
            self.canonical = attrs.get("href", "")
        if tag == "a" and attrs.get("href"):
            self.links.append(attrs["href"])
        if tag in {"img", "video", "source"}:
            self.assets.update(attrs[k] for k in ("src", "poster") if attrs.get(k, "").startswith("/"))
            self.assets.update(candidate.strip().split()[0] for candidate in attrs.get("srcset", "").split(",") if candidate.strip().startswith("/"))
        hidden = any(x["hidden"] for x in self.stack) or tag in {"script", "style", "svg", "noscript"} or attrs.get("aria-hidden") == "true"
        node = {"tag": tag, "attrs": attrs, "hidden": hidden, "text": []}
        if tag in {"h1", "h2", "h3", "p"} and not hidden and any(x["tag"] == "main" for x in self.stack):
            node["record"] = not any(x["tag"] == "details" for x in self.stack)
        if attrs.get("aria-roledescription") == "carousel" and attrs.get("aria-label", "").startswith("Creative production"):
            node["media"] = {"videos": 0, "images": 0}
            self.carousels.append(node["media"])
        for ancestor in self.stack:
            if "media" in ancestor:
                if tag == "video": ancestor["media"]["videos"] += 1
                if tag == "img": ancestor["media"]["images"] += 1
        if tag not in VOID:
            self.stack.append(node)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID:
            self.handle_endtag(tag)

    def handle_data(self, data):
        for node in self.stack:
            if not node["hidden"]:
                node["text"].append(data)

    def handle_endtag(self, tag):
        index = next((i for i in range(len(self.stack) - 1, -1, -1) if self.stack[i]["tag"] == tag), None)
        if index is None:
            return
        for node in self.stack[index:]:
            text = " ".join(" ".join(node["text"]).split())
            if node["tag"] == "title": self.title = text
            if node.get("record") and text:
                self.copy.append({"tag": node["tag"], "text": text, "words": len(text.split())})
        del self.stack[index:]


def get(url, method="GET"):
    try:
        with urlopen(Request(url, method=method), timeout=30) as response:
            return response.status, response.read().decode("utf-8") if method == "GET" else ""
    except Exception as error:
        return getattr(error, "code", 0), str(error)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("base")
    parser.add_argument("--report", default="/tmp/bfo-public-site-qa.json")
    args = parser.parse_args()
    base = args.base.rstrip("/")
    status, xml = get(base + "/sitemap.xml")
    if status != 200:
        raise SystemExit(f"Sitemap could not be loaded: HTTP {status}, {xml[:160]}")
    paths = [urlsplit(node.text).path for node in ET.fromstring(xml).iter() if node.tag.endswith("}loc")]
    with ThreadPoolExecutor(max_workers=4) as pool:
        pages = dict(zip(paths, pool.map(lambda path: get(base + path), paths)))
    documents = {path: Document(html) for path, (status, html) in pages.items() if status == 200}
    errors, warnings, extra_destinations = [], [], set()
    for path, (status, _) in pages.items():
        if status != 200:
            errors.append(f"{path}: HTTP {status}")
            continue
        doc = documents[path]
        for label, value in [("title", doc.title), ("description", doc.description), ("canonical", doc.canonical)]:
            if not value: errors.append(f"{path}: missing {label}")
        headings = [node for node in doc.copy if node["tag"] == "h1"]
        if len(headings) != 1: errors.append(f"{path}: expected one H1, found {len(headings)}")
        if doc.duplicates: errors.append(f"{path}: duplicate IDs {doc.duplicates}")
        for carousel in doc.carousels:
            if carousel["videos"] != 1 or carousel["images"] != 0:
                errors.append(f"{path}: overlapping carousel media {carousel}")
        for href in doc.links:
            target = urlsplit(urljoin(base + path, href))
            if target.netloc != urlsplit(base).netloc or target.scheme not in {"http", "https"}:
                continue
            destination = target.path or "/"
            if destination not in documents:
                extra_destinations.add(destination)
            if destination in documents and target.fragment and unquote(target.fragment) not in documents[destination].ids:
                errors.append(f"{path}: missing destination {destination}#{target.fragment}")
        if path not in {"/privacy", "/terms"}:
            warnings.extend({"path": path, **node} for node in doc.copy if node["words"] > (40 if node["tag"] == "p" else 12))
    assets = sorted({asset for doc in documents.values() for asset in doc.assets} | extra_destinations)
    with ThreadPoolExecutor(max_workers=6) as pool:
        asset_statuses = dict(zip(assets, pool.map(lambda path: get(base + path, "HEAD")[0], assets)))
    errors.extend(f"Media {path}: HTTP {status}" for path, status in asset_statuses.items() if status != 200)
    report = {"base": base, "routes": len(paths), "media": len(assets), "media_status": asset_statuses, "errors": sorted(set(errors)), "copy_review": warnings,
              "pages": {path: {"title": doc.title, "headings": [node for node in doc.copy if node["tag"].startswith("h")]} for path, doc in documents.items()},
              "visual_qa": "Requires a browser review at desktop and mobile sizes; not established by this structural audit."}
    with open(args.report, "w") as output:
        json.dump(report, output, indent=2)
    print(json.dumps({"routes": report["routes"], "media": report["media"], "errors": report["errors"], "copy_review_count": len(warnings), "report": args.report}, indent=2))
    raise SystemExit(bool(errors))


if __name__ == "__main__":
    main()
