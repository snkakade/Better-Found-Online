import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const source = path => readFileSync(new URL(`../src/${path}`, import.meta.url), "utf8");
const actions = source("site-actions.css");

test("shared primary actions use brand lighting and a depressed one-pixel press", () => {
  for (const token of ["--button-bg-top", "--button-bg-bottom", "--button-highlight", "--button-inset-shadow", "--button-contact-shadow", "--button-ambient-shadow"]) assert.ok(actions.includes(token));
  assert.match(actions, /--button-radius: 10px/);
  assert.match(actions, /linear-gradient\(180deg, var\(--button-bg-top\), var\(--button-bg-bottom\)\)/);
  assert.match(actions, /translate: 0 var\(--action-offset\)/);
  assert.match(actions, /--action-offset: var\(--button-press-offset\)/);
  assert.match(actions, /--button-press-offset: 1px/);
  assert.match(actions, /--button-hover-offset: 0px; --button-press-offset: 0px/);
  assert.match(actions, /--action-press-shadow: inset 0 2px 4px/);
  assert.match(actions, /--button-hover-duration: 220ms/);
  assert.match(actions, /--button-press-duration: 120ms/);
  assert.doesNotMatch(actions, /@keyframes|animation:|!important\s*[;}]/);
});

test("all conversion templates share one system without styling report tabs or whole related-service cards as CTAs", () => {
  for (const selector of [".desktop-navigation-cta", ".primary-btn", ".footer-project-link", ".site-menu-cta > a", ".contact-form-actions > button", ".website-service-link", ".service-link", ".campaign-source-action", ".scroll63-hero-outro-cta"]) assert.ok(actions.includes(selector));
  assert.match(actions, /bfo-action--primary/);
  assert.match(actions, /bfo-action--secondary/);
  assert.match(actions, /bfo-action--tertiary/);
  assert.match(actions, /service-detail-related:not\(\.performance-related\)/);
  assert.doesNotMatch(actions, /campaign-report-tabs/);
});

test("shared action states support keyboard, touch, disabled, busy, forced colours, and reduced motion", () => {
  for (const state of [":focus-visible", ":disabled", '[aria-disabled="true"]', '[aria-busy="true"]', "prefers-reduced-motion: reduce", "forced-colors: active", "touch-action: manipulation"]) assert.ok(actions.includes(state));
  assert.match(actions, /max-width: 100%/);
  assert.match(actions, /white-space: normal/);
  assert.match(actions, /min-height: 44px/);
});

test("platform marks use supplied assets and preserve campaign-to-platform mapping", () => {
  const marks = source("components/ad-platform-mark.tsx");
  for (const path of ["google-ads-logo.webp", "amazon-ads-logo.webp", "linkedin-mark.png", "bing-logo.svg"]) {
    assert.ok(marks.includes(path));
    assert.ok(existsSync(new URL(`../public/assets/platforms/${path}`, import.meta.url)));
  }
  assert.match(marks, /MetaLogo/);
  const reports = source("components/performance-proof-cards.tsx");
  assert.match(reports, /item\.platform === "Amazon Ads" \? "amazon" : "google"/);
  assert.match(reports, /role="tab"/);
  assert.match(reports, /aria-selected=\{active === index\}/);
  assert.match(reports, /onKeyDown=\{\(event\) => navigateReports/);
  assert.doesNotMatch(reports, /platform="linkedin"|platform="meta"/);
});

test("public video components autoplay silently without native or custom player buttons", () => {
  for (const path of ["components/website-preview.tsx", "components/ambient-video.tsx", "components/creative-story-components.tsx", "components/creative-proof-reel/creative-proof-reel.tsx", "routes/studio.tsx"]) {
    const component = source(path);
    assert.match(component, /autoPlay/);
    assert.match(component, /useAutoplayVideo/);
    assert.doesNotMatch(component, /controls=|website-preview-play|service-video-toggle|slider-media-play|proof-video-play|needsPlay|manualPlay/);
  }
  const hook = source("hooks/use-autoplay-video.ts");
  assert.match(hook, /enabled && visible && !document\.hidden && !motion\.matches/);
  assert.match(hook, /video\.defaultMuted = true/);
  assert.match(hook, /video\.controls = false/);
  assert.match(hook, /observer\.disconnect\(\)/);
  for (const event of ["canplay", "change", "visibilitychange", "pointerup", "online"]) assert.ok(hook.includes(`removeEventListener("${event}"`));
});
