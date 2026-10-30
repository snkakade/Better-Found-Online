import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { MOBILE_CHAPTER_START, MOBILE_CHAPTER_APPROACH_END, mobileChapterFocus, mobileTunnelPresence } from "../src/lib/tunnel-pacing.ts";

const source = path => readFileSync(new URL(`../src/${path}`, import.meta.url), "utf8");

test("the first mobile card cannot take over while the hero is still on screen", () => {
  assert.equal(MOBILE_CHAPTER_START, "top 58%");
  assert.match(source("mobile-refinements.css"), /story-intro \{ min-height: 100svh/);
  assert.match(source("components/brand-tunnel.tsx"), /compact \? MOBILE_CHAPTER_START : "top 80%"/);
  const firstCardScrollScreens = 1 + 1 - 0.58;
  assert.ok(firstCardScrollScreens > 1.4);
});

test("distant chapter cards do not dim the tunnel", () => {
  for (const progress of [0, 0.01, 0.05, 0.1, 0.14]) {
    assert.equal(mobileChapterFocus(progress), 0);
    assert.equal(mobileTunnelPresence(mobileChapterFocus(progress)), 1);
  }
  assert.equal(mobileChapterFocus(MOBILE_CHAPTER_APPROACH_END), 1);
});

test("prepared cards wait inside the tunnel instead of peeking as HTML before their entrance", () => {
  assert.match(source("components/brand-tunnel.tsx"), /waiting = motionAllowed && loadedTextures === textureSources\.length && progress <= 0\.001/);
  assert.match(source("mobile-refinements.css"), /data-tunnel-ready="true"\] \.story-beat\[data-tunnel-card="waiting"\] \.story-beat-media \{ opacity: 0/);
});

test("tunnel sculpture and passing imagery remain visible throughout every chapter", () => {
  for (let step = 0; step <= 1000; step++) {
    const focus = mobileChapterFocus(step / 1000);
    assert.ok(focus >= 0 && focus <= 1);
    assert.ok(mobileTunnelPresence(focus) >= 0.38);
  }
  assert.equal(mobileTunnelPresence(1), 0.38);
  assert.equal(mobileChapterFocus(1), 0);
});

test("focus is smooth and reversible, without an active-card opacity cliff", () => {
  const points = Array.from({ length: 1001 }, (_, index) => mobileTunnelPresence(mobileChapterFocus(index / 1000)));
  for (let index = 1; index < points.length; index++) assert.ok(Math.abs(points[index] - points[index - 1]) < 0.004);
  const tunnel = source("components/brand-tunnel.tsx");
  assert.match(tunnel, /compact \? 0\.84 \* tunnelPresence : chapterActive \? 0\.025/);
  assert.match(tunnel, /compact \? 0\.68 \* tunnelPresence : chapterActive \? 0/);
  assert.match(tunnel, /chapter\.group\.renderOrder = compact \? 1 : 0/);
  assert.match(tunnel, /delete journey\.dataset\.chapterFocus/);
  assert.match(source("mobile-refinements.css"), /home-page\.motion-paused \.story-intro \{ min-height: 0/);
});
