export const PROOF_DWELL_MS = 1800;
export const PROOF_TRANSITION_MS = 780;

export type OrbitGeometry = {
  width: number;
  height: number;
  cardWidth: number;
  cardHeight: number;
  headingHeight: number;
  headingWidth: number;
  compact: boolean;
};
type Position = { x: number; y: number; scale: number; opacity: number };

export function orbitSlot(index: number, active: number, count: number) {
  return (index - active + count) % count;
}

export function queueScale(geometry: OrbitGeometry) {
  const { width, height, cardWidth, cardHeight, headingHeight } = geometry;
  return Math.max(.1, Math.min(.48,
    (height - headingHeight - 24 - 20 - 8) / (cardHeight * 2),
    (width - cardWidth - 40) / cardWidth,
  ));
}

export function orbitPosition(slot: number, geometry: OrbitGeometry): Position {
  const { width, height, cardWidth, cardHeight, headingHeight, compact } = geometry;
  if (compact) return {
    x: slot === 0 ? (width - cardWidth) / 2 : slot === 1 ? -cardWidth - 12 : width + 12,
    y: (height - cardHeight) / 2,
    scale: 1,
    opacity: slot === 0 ? 1 : 0,
  };
  const scale = slot === 0 ? 1 : queueScale(geometry);
  return {
    x: slot === 0 ? width - cardWidth - 8 : 8,
    y: slot === 0 ? (height - cardHeight) / 2 : slot === 1 ? headingHeight + 24 : height - cardHeight * scale - 8,
    scale,
    opacity: 1,
  };
}

function frame(position: Position) {
  return {
    transform: `translate3d(${position.x}px,${position.y}px,0) rotate(0deg) scale(${position.scale})`,
    opacity: position.opacity,
  };
}
export function orbitFrame(slot: number, geometry: OrbitGeometry) {
  return frame(orbitPosition(slot, geometry));
}

export function orbitFrames(index: number, from: number, to: number, count: number, geometry: OrbitGeometry) {
  const fromSlot = orbitSlot(index, from, count), toSlot = orbitSlot(index, to, count);
  const start = orbitPosition(fromSlot, geometry), end = orbitPosition(toSlot, geometry);
  const center = (position: Position) => ({ x: position.x + geometry.cardWidth * position.scale / 2, y: position.y + geometry.cardHeight * position.scale / 2 });
  const a = center(start), b = center(end);
  const upperPath = fromSlot === 1 || toSlot === 1;
  const control = fromSlot !== 0 && toSlot !== 0
    ? { x: a.x + geometry.width * .06, y: (a.y + b.y) / 2 }
    : upperPath
      ? { x: Math.max(a.x, b.x) + geometry.width * .02, y: (fromSlot === 1 ? a : b).y }
      : { x: (a.x + b.x) / 2 + geometry.width * .15, y: Math.max(a.y, b.y) };
  return Array.from({ length: 25 }, (_, sample) => {
    const t = sample / 24;
    if (sample === 0 || sample === 24) return { ...frame(sample === 0 ? start : end), offset: t };
    const scaleProgress = toSlot === 0 ? t ** 3 : fromSlot === 0 ? 1 - (1 - t) ** 2 : t;
    const scale = start.scale + (end.scale - start.scale) * scaleProgress;
    let x = (1 - t) ** 2 * a.x + 2 * (1 - t) * t * control.x + t ** 2 * b.x - geometry.cardWidth * scale / 2;
    let y = (1 - t) ** 2 * a.y + 2 * (1 - t) * t * control.y + t ** 2 * b.y - geometry.cardHeight * scale / 2;
    if (geometry.compact) {
      y += Math.sin(t * Math.PI) * (fromSlot === 0 ? 24 : -24);
    } else {
      x = Math.max(8, Math.min(x, geometry.width - geometry.cardWidth * scale - 8));
      y = Math.max(8, Math.min(y, geometry.height - geometry.cardHeight * scale - 8));
      // The queue's curved travel must never pass over the section heading.
      if (x < geometry.headingWidth + 24) y = Math.max(y, geometry.headingHeight + 24);
    }
    return { ...frame({ x, y, scale, opacity: start.opacity + (end.opacity - start.opacity) * t }), offset: t };
  });
}
