import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { orbitAngle, orbitFrame, orbitFrames, PROOF_DWELL_MS, PROOF_TRANSITION_MS } from '../src/components/creative-proof-reel/proof-orbit.ts';

const desktop = { width: 1440, height: 580, cardWidth: 860, cardHeight: 475.6, compact: false };
function unpack(frame) {
  const [, x, y, rotation, scale] = frame.transform.match(/translate3d\(([-\d.e]+)px,([-\d.e]+)px,0\) rotate\(([-\d.e]+)deg\) scale\(([-\d.e]+)\)/);
  return { x: +x, y: +y, rotation: +rotation, scale: +scale, opacity: frame.opacity };
}
test('each edit receives a full 1.8 second focus hold, separate from the transition', () => {
  assert.equal(PROOF_DWELL_MS, 1800);
  assert.ok(PROOF_TRANSITION_MS >= 600 && PROOF_TRANSITION_MS <= 1000);
});
test('each of the three cards takes the same large left position exactly once per cycle', () => {
  const focus = orbitFrame(Math.PI, desktop);
  for (let active = 0; active < 3; active++) {
    assert.deepEqual(orbitFrame(orbitAngle(active, active, 3), desktop), focus);
    const positions = [0, 1, 2].map(index => unpack(orbitFrame(orbitAngle(index, active, 3), desktop)));
    assert.equal(positions[active].scale, 1);
    assert.ok(positions[active].x < 20);
    for (const [index, position] of positions.entries()) {
      if (index !== active) { assert.ok(position.x > desktop.width * .6); assert.ok(position.scale < .6); }
    }
  }
});
test('curved keyframes join each destination without a jump, including the loop seam', () => {
  for (let from = 0; from < 3; from++) for (let index = 0; index < 3; index++) {
    const to = (from + 1) % 3;
    const frames = orbitFrames(index, from, to, 3, desktop);
    assert.equal(frames.length, 25);
    for (const [sample, expected] of [[0, orbitFrame(orbitAngle(index, from, 3), desktop)], [24, orbitFrame(orbitAngle(index, to, 3), desktop)]]) {
      const actual = unpack(frames[sample]); const target = unpack(expected);
      for (const key of ['x', 'y', 'scale', 'opacity']) assert.ok(Math.abs(actual[key] - target[key]) < .00001);
    }
    const first = unpack(frames[0]), middle = unpack(frames[12]), last = unpack(frames[24]);
    assert.ok(Math.abs(middle.y - (first.y + last.y) / 2) > 8, 'travels on an arc, not a straight crossfade');
  }
});
test('all desktop and tablet travel stays inside the stage without cropping the card', () => {
  for (const geometry of [desktop, { width: 700, height: 440, cardWidth: 434, cardHeight: 360, compact: false }]) {
    for (let sample = 0; sample <= 360; sample++) {
      const frame = unpack(orbitFrame(sample / 180 * Math.PI, geometry));
      assert.ok(frame.x >= 15.9 && frame.y >= 15.9);
      assert.ok(frame.x + geometry.cardWidth * frame.scale <= geometry.width - 15.9);
      assert.ok(frame.y + geometry.cardHeight * frame.scale <= geometry.height - 15.9);
      assert.ok(frame.opacity >= 0 && frame.opacity <= 1);
    }
  }
});
test('mobile keeps one readable full-size card while the queue leaves the narrow viewport', () => {
  const mobile = { width: 280, height: 350, cardWidth: 280, cardHeight: 308, compact: true };
  assert.equal(unpack(orbitFrame(Math.PI, mobile)).scale, 1);
  assert.equal(unpack(orbitFrame(Math.PI, mobile)).x, 0);
  assert.equal(orbitFrame(Math.PI / 3, mobile).opacity, 0);
  assert.equal(orbitFrame(-Math.PI / 3, mobile).opacity, 0);
});
test('runtime preserves full-frame video, pause controls, reduced motion and cleanup', () => {
  const base = new URL('../src/components/creative-proof-reel/', import.meta.url);
  const css = readFileSync(new URL('creative-proof-reel.css', base), 'utf8');
  const component = readFileSync(new URL('creative-proof-reel.tsx', base), 'utf8');
  const hook = readFileSync(new URL('use-proof-orbit.ts', base), 'utf8');
  assert.match(css, /object-fit: contain/);
  assert.doesNotMatch(css, /object-fit: cover/);
  assert.match(component, /Pause rotation/);
  assert.match(component, /aria-pressed/);
  assert.match(component, /onFocusCapture/);
  assert.match(component, /onPointerEnter/);
  assert.match(hook, /!motion.matches && visible && !document.hidden/);
  assert.match(hook, /ResizeObserver/);
  assert.match(hook, /animation.cancel\(\)/);
  assert.match(hook, /observer.disconnect\(\); resize.disconnect\(\)/);
});
