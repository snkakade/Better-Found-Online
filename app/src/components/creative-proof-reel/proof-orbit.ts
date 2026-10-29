export const PROOF_DWELL_MS = 1800;
export const PROOF_TRANSITION_MS = 780;
const TURN = Math.PI * 2;

export type OrbitGeometry = {
  width: number;
  height: number;
  cardWidth: number;
  cardHeight: number;
  compact: boolean;
};

export function orbitAngle(index: number, active: number, count: number) {
  return Math.PI - (((index - active + count) % count) * TURN) / count;
}

export function orbitFrame(angle: number, geometry: OrbitGeometry) {
  const { width, height, cardWidth, cardHeight, compact } = geometry;
  const focus = (1 - Math.cos(angle)) / 2;
  if (compact) {
    const scale = .82 + .18 * focus;
    const centerX = width / 2 + (1 - focus) * width * 1.35;
    return {
      transform: `translate3d(${centerX - cardWidth * scale / 2}px,${(height - cardHeight * scale) / 2 + Math.sin(angle) * 42}px,0) rotate(${Math.sin(angle) * 5}deg) scale(${scale})`,
      opacity: Math.max(0, (focus - .58) / .42),
    };
  }
  const padding = 16;
  const sideScale = .56;
  const focusX = cardWidth / 2 + padding;
  const queueX = width - cardWidth * sideScale / 2 - padding;
  const radiusX = Math.max(0, (queueX - focusX) * 2 / 3);
  const radiusY = Math.max(0, (height - cardHeight * sideScale - padding * 2) / Math.sqrt(3));
  const desiredScale = sideScale + (1 - sideScale) * (focus - .25) / .75;
  const centerX = Math.min(focusX + radiusX + Math.cos(angle) * radiusX, width - cardWidth * desiredScale / 2 - padding);
  const centerY = height / 2 + Math.sin(angle) * radiusY;
  // Keep the whole video inside the stage, including the curved travel between slots.
  const scale = Math.max(.1, Math.min(
    desiredScale,
    (Math.min(centerX, width - centerX) - padding) * 2 / cardWidth,
    (Math.min(centerY, height - centerY) - padding) * 2 / cardHeight,
  ));
  return {
    transform: `translate3d(${centerX - cardWidth * scale / 2}px,${centerY - cardHeight * scale / 2}px,0) rotate(${Math.sin(angle) * -1.25}deg) scale(${scale})`,
    opacity: .83 + .17 * focus,
  };
}

export function orbitFrames(index: number, from: number, to: number, count: number, geometry: OrbitGeometry) {
  let steps = (to - from + count) % count;
  if (steps > count / 2) steps -= count;
  const start = orbitAngle(index, from, count);
  return Array.from({ length: 25 }, (_, sample) => ({
    ...orbitFrame(start + sample / 24 * steps * TURN / count, geometry),
    offset: sample / 24,
  }));
}
