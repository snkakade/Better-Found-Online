/** Mobile pacing: a full intro passage before the chapter can take focus. */
export const MOBILE_CHAPTER_START = "top 58%";
export const MOBILE_CHAPTER_APPROACH_END = 0.4;

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const smoothstep = (value: number, start: number, end: number) => {
  const t = clamp((value - start) / (end - start));
  return t * t * (3 - 2 * t);
};

/** A tiny, distant card is not a focused card. Ease emphasis in and out. */
export function mobileChapterFocus(progress: number) {
  return smoothstep(progress, 0.14, MOBILE_CHAPTER_APPROACH_END)
    * (1 - smoothstep(progress, 0.7, 0.96));
}

/** Keep the surrounding sculpture and passing cards visible at full focus. */
export function mobileTunnelPresence(focus: number) {
  return 1 - clamp(focus) * 0.62;
}
