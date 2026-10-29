import assert from "node:assert/strict";
import test from "node:test";
import { statSync } from "node:fs";
import { applyMediaRange } from "../src/lib/media-range.server.ts";
import { mediaAssetSizes } from "../src/media-asset-sizes.ts";

const request = (range, extra = {}) => new Request("https://example.com/assets/video.mp4", { headers: { ...(range ? { range } : {}), ...extra } });
const asset = () => new Response("0123456789", { headers: { "content-length": "10", "content-type": "video/mp4", etag: '"clip-v1"', "last-modified": "Wed, 28 Oct 2026 12:00:00 GMT" } });

test("deployed video byte lengths match every canonical media file", () => {
  for (const [path, bytes] of Object.entries(mediaAssetSizes)) assert.equal(statSync(new URL(`../public${path}`, import.meta.url)).size, bytes, path);
});

test("uses verified asset metadata when Pages omits Content-Length", async () => {
  const response = applyMediaRange(request("bytes=0-1"), new Response("0123456789"), 10);
  assert.equal(response.status, 206);
  assert.equal(response.headers.get("content-length"), "2");
  assert.equal(await response.text(), "01");
});

for (const [range, expected, contentRange] of [
  ["bytes=0-1", "01", "bytes 0-1/10"],
  ["bytes=3-6", "3456", "bytes 3-6/10"],
  ["bytes=7-", "789", "bytes 7-9/10"],
  ["bytes=-3", "789", "bytes 7-9/10"],
  ["bytes=0-9999999999999999999999", "0123456789", "bytes 0-9/10"],
]) test(`streams the exact Safari probe/seek range ${range}`, async () => {
  const response = applyMediaRange(request(range), asset());
  assert.equal(response.status, 206);
  assert.equal(response.headers.get("content-range"), contentRange);
  assert.equal(response.headers.get("content-length"), String(expected.length));
  assert.equal(response.headers.get("content-type"), "video/mp4");
  assert.equal(await response.text(), expected);
});

test("streams across chunk boundaries without buffering the full recording", async () => {
  const encoder = new TextEncoder();
  const body = new ReadableStream({ start(controller) { for (const chunk of ["012", "345", "6789"]) controller.enqueue(encoder.encode(chunk)); controller.close(); } });
  const response = applyMediaRange(request("bytes=2-7"), new Response(body, { headers: { "content-length": "10" } }));
  assert.equal(await response.text(), "234567");
});

test("unsatisfiable ranges return 416 and a valid total size", () => {
  for (const range of ["bytes=10-", "bytes=5-2", "bytes=-0"]) {
    const response = applyMediaRange(request(range), asset());
    assert.equal(response.status, 416);
    assert.equal(response.headers.get("content-range"), "bytes */10");
  }
});

test("preserves a complete response when Range is absent, malformed or multipart", async () => {
  for (const range of [null, "garbage", "bytes=0-1,4-5"]) {
    const response = applyMediaRange(request(range), asset());
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("accept-ranges"), "bytes");
    assert.equal(await response.text(), "0123456789");
  }
});

test("If-Range respects changed validators, weak ETags and modification dates", async () => {
  for (const value of ['"old-clip"', 'W/"clip-v1"', "Tue, 27 Oct 2026 12:00:00 GMT"]) {
    const response = applyMediaRange(request("bytes=0-1", { "if-range": value }), asset());
    assert.equal(response.status, 200);
    assert.equal(await response.text(), "0123456789");
  }
  assert.equal(applyMediaRange(request("bytes=0-1", { "if-range": '"clip-v1"' }), asset()).status, 206);
});

test("HEAD, pre-existing partials, compression and errors are not rewritten as new ranges", () => {
  const head = applyMediaRange(new Request("https://example.com/v.mp4", { method: "HEAD", headers: { range: "bytes=0-1" } }), new Response(null, { headers: { "content-length": "10" } }));
  assert.equal(head.status, 200);
  assert.equal(head.headers.get("content-length"), "10");
  for (const response of [new Response("01", { status: 206 }), new Response(null, { status: 304 }), new Response(null, { status: 404 }), new Response("gzip", { headers: { "content-length": "4", "content-encoding": "gzip" } })]) assert.equal(applyMediaRange(request("bytes=0-1"), response), response);
});
