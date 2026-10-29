import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { orbitSlot, orbitPosition, orbitFrame, orbitFrames, queueScale, PROOF_DWELL_MS, PROOF_TRANSITION_MS } from '../src/components/creative-proof-reel/proof-orbit.ts';

const desktop = { width: 1440, height: 680, cardWidth: 835.2, cardHeight: 544, headingHeight: 190, headingWidth: 518.4, compact: false };
const sizes = [
  desktop,
  { width: 1296, height: 600, cardWidth: 751.68, cardHeight: 480, headingHeight: 170, headingWidth: 466.56, compact: false },
  { width: 922, height: 448, cardWidth: 534.76, cardHeight: 358.4, headingHeight: 160, headingWidth: 331.92, compact: false },
];
function unpack(frame) {
  const [, x, y, rotation, scale] = frame.transform.match(/translate3d\(([-\d.e]+)px,([-\d.e]+)px,0\) rotate\(([-\d.e]+)deg\) scale\(([-\d.e]+)\)/);
  return { x: +x, y: +y, rotation: +rotation, scale: +scale, opacity: frame.opacity };
}
test('each edit receives a full 1.8 second hold, separate from the transition', () => {
  assert.equal(PROOF_DWELL_MS, 1800);
  assert.ok(PROOF_TRANSITION_MS >= 600 && PROOF_TRANSITION_MS <= 1000);
});
test('every card takes exactly the same enlarged RIGHT-hand focus position', () => {
  for (let active = 0; active < 3; active++) {
    assert.equal(orbitSlot(active, active, 3), 0);
    const focus = orbitPosition(orbitSlot(active, active, 3), desktop);
    assert.equal(focus.scale, 1);
    assert.equal(focus.x, desktop.width - desktop.cardWidth - 8);
    assert.ok(focus.x >= desktop.headingWidth + 24);
  }
});
test('the two smaller cards align upright below the left-hand heading without overlapping', () => {
  for (const geometry of sizes) {
    const upper = orbitPosition(1, geometry), lower = orbitPosition(2, geometry);
    assert.equal(upper.x, 8);
    assert.equal(lower.x, 8);
    assert.equal(upper.scale, lower.scale);
    assert.equal(upper.scale, queueScale(geometry));
    assert.ok(upper.y >= geometry.headingHeight + 24);
    assert.ok(lower.y - upper.y - geometry.cardHeight * upper.scale >= 19.99);
    assert.ok(lower.y + geometry.cardHeight * lower.scale <= geometry.height - 7.99);
  }
});
test('every animation frame stays perfectly upright: no tilt, skew, or 3D flip', () => {
  for (let from = 0; from < 3; from++) for (let index = 0; index < 3; index++) {
    const frames = orbitFrames(index, from, (from + 1) % 3, 3, desktop);
    assert.equal(frames.length, 25);
    for (const frame of frames) {
      assert.equal(unpack(frame).rotation, 0);
      assert.doesNotMatch(frame.transform, /skew|rotateX|rotateY/);
    }
  }
});
test('curved hand-offs return precisely to the original slots, including the loop seam', () => {
  for (let from = 0; from < 3; from++) for (let index = 0; index < 3; index++) {
    const to = (from + 1) % 3;
    const frames = orbitFrames(index, from, to, 3, desktop);
    assert.deepEqual(frames[0], { ...orbitFrame(orbitSlot(index, from, 3), desktop), offset: 0 });
    assert.deepEqual(frames[24], { ...orbitFrame(orbitSlot(index, to, 3), desktop), offset: 1 });
    const a = unpack(frames[0]), b = unpack(frames[24]), midpoint = unpack(frames[12]);
    assert.ok(Math.abs(midpoint.x - (a.x + b.x) / 2) > 8 || Math.abs(midpoint.y - (a.y + b.y) / 2) > 8);
  }
});
test('desktop travel fits the viewport and cannot cross over the heading', () => {
  for (const geometry of sizes) for (let from = 0; from < 3; from++) for (let index = 0; index < 3; index++) {
    for (const keyframe of orbitFrames(index, from, (from + 1) % 3, 3, geometry)) {
      const frame = unpack(keyframe);
      assert.ok(frame.x >= 7.99 && frame.y >= 7.99);
      assert.ok(frame.x + geometry.cardWidth * frame.scale <= geometry.width - 7.99);
      assert.ok(frame.y + geometry.cardHeight * frame.scale <= geometry.height - 7.99);
      if (frame.x < geometry.headingWidth + 24) assert.ok(frame.y >= geometry.headingHeight + 24);
    }
  }
});
test('mobile keeps one full-size, upright example and hides only the queued cards', () => {
  const phone = { width: 280, height: 320, cardWidth: 280, cardHeight: 288, headingHeight: 160, headingWidth: 280, compact: true };
  const focused = orbitPosition(0, phone);
  assert.equal(focused.x, 0);
  assert.equal(focused.scale, 1);
  assert.equal(focused.opacity, 1);
  assert.equal(orbitPosition(1, phone).opacity, 0);
  assert.equal(orbitPosition(2, phone).opacity, 0);
  for (const frame of orbitFrames(0, 0, 1, 3, phone)) assert.equal(unpack(frame).rotation, 0);
});
test('visible toolbars are removed without losing full-frame video or accessible interaction', () => {
  const base = new URL('../src/components/creative-proof-reel/', import.meta.url);
  const css = readFileSync(new URL('creative-proof-reel.css', base), 'utf8');
  const component = readFileSync(new URL('creative-proof-reel.tsx', base), 'utf8');
  const hook = readFileSync(new URL('use-proof-orbit.ts', base), 'utf8');
  assert.match(css, /object-fit: contain/);
  assert.doesNotMatch(css, /object-fit: cover/);
  assert.doesNotMatch(component + css, /proof-orbit-toggle|proof-orbit-choices|Pause rotation/);
  assert.match(component, /onKeyDown/);
  assert.match(component, /onPointerUp/);
  assert.match(component, /onFocusCapture/);
  assert.match(component, /onPointerEnter/);
  assert.match(component, /aria-disabled/);
  assert.match(hook, /!motion.matches && visible && !document.hidden/);
  assert.match(hook, /resize.observe\(heading\)/);
  assert.match(hook, /animation.cancel\(\)/);
  assert.match(hook, /observer.disconnect\(\); resize.disconnect\(\)/);
});
