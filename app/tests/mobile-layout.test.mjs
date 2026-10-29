import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = (path) => readFileSync(new URL(`../src/${path}`, import.meta.url), "utf8");
const mobile = source("mobile-refinements.css");
const chrome = source("components/site-chrome.tsx");
const story = source("components/information-scroll-story.tsx");
const storyCss = source("information-scroll-story.css");
const creative = source("components/creative-story-components.tsx");

test("the mobile reading layer is public-site scoped and imported after shared actions", () => {
  const styles = source("styles.css");
  assert.ok(styles.indexOf('"./mobile-refinements.css"') > styles.indexOf('"./site-actions.css"'));
  assert.match(mobile, /@media \(max-width: 900px\)/);
  assert.match(mobile, /:root \.site/);
  assert.doesNotMatch(mobile, /console|admin|--q-|\.q-/);
});

test("mobile enquiry fields avoid iOS text zoom and footer links have touch-sized targets", () => {
  assert.match(mobile, /textarea, select\) \{ font-size: 16px/);
  assert.match(mobile, /footer-directory a:not\(\.brand\) \{ min-height: 44px/);
  assert.match(mobile, /footer-bottom :is\(a,button\) \{ min-height: 44px/);
});

test("small-screen information stories use readable document flow, not desktop pinning", () => {
  assert.match(story, /media\.add\("\(min-width: 901px\) and \(prefers-reduced-motion: no-preference\)"/);
  assert.match(story, /return \(\) => media\.revert\(\)/);
  assert.match(storyCss, /scroll63-hero-bg-content-copy p \{ font-size: 1rem; line-height: 1\.6/);
  assert.match(storyCss, /scroll63-hero \{ display: grid; height: auto; min-height: 0/);
});

test("mobile navigation includes the primary pages and an accessible native Services disclosure", () => {
  for (const page of ["/work", "/studio", "/insights"]) assert.ok(chrome.includes(`href="${page}" onClick={() => setOpen(false)}`));
  assert.match(chrome, /<details className="site-menu-services">/);
  assert.match(chrome, /<summary>Services/);
  assert.match(chrome, /button:not\(\[disabled\]\), summary/);
  assert.match(chrome, /getClientRects\(\)\.length > 0/);
});

test("landscape showcase videos stay full-frame, with actions outside the footage", () => {
  assert.match(mobile, /slide-images \{[^}]+aspect-ratio: 16 \/ 9/s);
  assert.match(mobile, /slider-video \{ object-fit: contain/);
  assert.match(mobile, /modular-slider-footer \{ position: static/);
  assert.match(creative, /closest\("a,button"\)\) return/);
});

test("showcase playback stops offscreen, in hidden tabs, and for reduced motion", () => {
  assert.match(creative, /visible && !document\.hidden && !motionPreference\.matches && !hiddenHalf/);
  assert.match(creative, /playbackObserver\.disconnect\(\)/);
  assert.match(creative, /removeEventListener\("visibilitychange", syncPlayback\)/);
  assert.match(creative, /compactVideo\.removeEventListener\("change", syncPlayback\)/);
});

test("the public creative process uses branded native controls, not app-kit typography", () => {
  assert.doesNotMatch(creative, /StepRail|@higgsfield\/quanta/);
  assert.match(creative, /<nav aria-label="Creative production process"/);
  assert.match(creative, /aria-pressed=\{current === title\}/);
});

test("cookie choice text is readable without changing consent copy or choices", () => {
  const css = source("analytics-consent.css");
  assert.match(css, /max-height: calc\(100svh - 92px\); overflow-y: auto/);
  assert.match(css, /consent-actions button \{ min-height: 48px; font-size: 14px/);
  assert.match(css, /font-size: 14px; line-height: 1\.5/);
});
