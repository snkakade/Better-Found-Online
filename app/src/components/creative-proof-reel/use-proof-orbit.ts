import { useEffect, useRef, useState, type RefObject } from "react";
import { orbitAngle, orbitFrame, orbitFrames, PROOF_DWELL_MS, PROOF_TRANSITION_MS } from "./proof-orbit";

export function useProofOrbit(stageRef: RefObject<HTMLDivElement | null>, count: number, paused: boolean) {
  const [active, setActive] = useState(0);
  const [moving, setMoving] = useState(false);
  const [compact, setCompact] = useState(false);
  const [reduced, setReduced] = useState(false);
  const pausedRef = useRef(paused);
  const controller = useRef<{ select: (index: number) => void; sync: () => void } | null>(null);

  useEffect(() => {
    pausedRef.current = paused;
    controller.current?.sync();
  }, [paused]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || count < 1) return;
    const cards = Array.from(stage.querySelectorAll<HTMLElement>(".proof-orbit-card"));
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const smallScreen = window.matchMedia("(max-width: 767px)");
    let current = 0;
    let visible = false;
    let inFlight = false;
    let disposed = false;
    let generation = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let animations: Animation[] = [];
    const geometry = () => ({
      width: stage.clientWidth, height: stage.clientHeight,
      cardWidth: cards[0].offsetWidth, cardHeight: cards[0].offsetHeight,
      compact: smallScreen.matches,
    });
    const clearTimer = () => { clearTimeout(timer); timer = undefined; };
    const place = () => {
      const size = geometry();
      cards.forEach((card, index) => {
        const frame = orbitFrame(orbitAngle(index, current, count), size);
        card.style.transform = frame.transform;
        card.style.opacity = String(frame.opacity);
        // Only these three local layers overlap; no site-wide stacking changes.
        card.style.zIndex = index === current ? "3" : "1";
      });
    };
    const sync = () => {
      clearTimer();
      if (count > 1 && !inFlight && !pausedRef.current && !motion.matches && visible && !document.hidden) {
        timer = setTimeout(() => select((current + 1) % count), PROOF_DWELL_MS);
      }
    };
    const settle = () => {
      generation += 1;
      animations.forEach((animation) => animation.cancel());
      animations = [];
      inFlight = false;
      place();
      setMoving(false);
    };
    const select = (next: number) => {
      if (disposed || inFlight || next === current || next < 0 || next >= count) return;
      clearTimer();
      const previous = current;
      current = next;
      setActive(next);
      if (motion.matches || typeof cards[0].animate !== "function") {
        place(); sync(); return;
      }
      inFlight = true;
      setMoving(true);
      const token = ++generation;
      const size = geometry();
      animations = cards.map((card, index) => {
        card.style.zIndex = index === next ? "3" : index === previous ? "2" : "1";
        return card.animate(orbitFrames(index, previous, next, count, size), {
          duration: PROOF_TRANSITION_MS, easing: "cubic-bezier(.45,0,.2,1)", fill: "forwards",
        });
      });
      void Promise.all(animations.map((animation) => animation.finished)).then(() => {
        if (disposed || token !== generation) return;
        settle(); sync();
      }).catch(() => undefined);
    };
    const measure = () => { settle(); sync(); };
    const preferenceChanged = () => {
      setCompact(smallScreen.matches);
      setReduced(motion.matches);
      settle(); sync();
    };
    const visibilityChanged = () => {
      if (document.hidden && inFlight) settle();
      sync();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && entry.intersectionRatio >= .45;
      if (!visible && inFlight) settle();
      sync();
    }, { threshold: [0, .45] });
    const resize = new ResizeObserver(measure);
    controller.current = { select, sync };
    preferenceChanged();
    resize.observe(stage);
    observer.observe(stage);
    motion.addEventListener("change", preferenceChanged);
    smallScreen.addEventListener("change", preferenceChanged);
    document.addEventListener("visibilitychange", visibilityChanged);
    return () => {
      disposed = true;
      generation += 1;
      clearTimer();
      animations.forEach((animation) => animation.cancel());
      observer.disconnect(); resize.disconnect();
      motion.removeEventListener("change", preferenceChanged);
      smallScreen.removeEventListener("change", preferenceChanged);
      document.removeEventListener("visibilitychange", visibilityChanged);
      controller.current = null;
    };
  }, [count, stageRef]);

  return { active, moving, compact, reduced, select: (index: number) => controller.current?.select(index) };
}
