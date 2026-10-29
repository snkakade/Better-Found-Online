"use client";

import { useEffect, useRef, useState } from "react";
import { useProofOrbit } from "./use-proof-orbit";
import "./creative-proof-reel.css";

export interface CreativeProofVideo {
  src: string;
  poster: string;
  label: string;
  navLabel?: string;
  title: string;
  detail: string;
}

function ProofVideo({ video, active }: { video: CreativeProofVideo; active: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [needsPlay, setNeedsPlay] = useState(true);
  const manualPlay = useRef(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    const sync = () => {
      if (active && visible && !document.hidden && (!motion.matches || manualPlay.current) && !element.error) {
        void element.play().catch(error => { if (error.name !== "AbortError") setNeedsPlay(true); });
      } else element.pause();
      if (active && motion.matches && !manualPlay.current) setNeedsPlay(true);
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    observer.observe(element);
    motion.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect(); element.pause();
      motion.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [active, video.src]);
  return <>
    <video ref={ref} src={video.src} poster={video.poster} width="540" height="960" muted loop playsInline preload="metadata" aria-label={`${video.label} before and after`} onPlaying={() => setNeedsPlay(false)} onError={() => setNeedsPlay(true)} />
    {needsPlay && active && <button className="proof-video-play" type="button" aria-label={`Play ${video.label.toLowerCase()} video`} onClick={(event) => {
      event.stopPropagation();
      const element = ref.current;
      if (!element) return;
      manualPlay.current = true;
      if (element.error || element.readyState === 0) element.load();
      void element.play().catch(() => setNeedsPlay(true));
    }}>Play video</button>}
  </>;
}

/** Preserve redesign: existing Outfit, white/royal blue, upright sharp geometry.
 * Design variance 6 / motion intensity 5 / visual density 3. One right-hand focus, two left-hand previews.
 */
export function CreativeProofReel({ videos }: { videos: CreativeProofVideo[] }) {
  const stage = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const gesture = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);
  const focusRequested = useRef<number | null>(null);
  const { active, moving, compact, select } = useProofOrbit(stage, videos.length, paused || hovered || focused);
  useEffect(() => {
    if (moving || focusRequested.current === null) return;
    stage.current?.querySelectorAll<HTMLButtonElement>(".proof-orbit-select")[focusRequested.current]?.focus();
    focusRequested.current = null;
  }, [active, moving]);
  if (!videos.length) return null;
  const choose = (index: number) => {
    if (moving) return;
    setPaused(true); setFocused(false); select(index);
  };
  return (
    <section className="creative-proof section-pad proof-orbit" id="edit-transformations" aria-labelledby="creative-proof-title" aria-roledescription="carousel"
      onFocusCapture={() => setFocused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
      onKeyDown={(event) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        if (moving) return;
        const index = event.key === "Home" ? 0 : event.key === "End" ? videos.length - 1 : (active + (event.key === "ArrowRight" ? 1 : -1) + videos.length) % videos.length;
        if (index === active) { setPaused(true); return; }
        focusRequested.current = index;
        choose(index);
      }}>
      <div className="proof-orbit-layout">
        <header className="creative-proof-header proof-orbit-header">
          <div><p className="eyebrow">Before / after</p><h2 id="creative-proof-title">See what the edit changes.</h2><p>Raw footage becomes clear, paced, platform-ready content.</p></div>
        </header>
        <div className="proof-orbit-stage" id="proof-orbit-stage" ref={stage} data-moving={moving} data-active={active}
          onPointerEnter={(event) => { if (event.pointerType === "mouse") setHovered(true); }} onPointerLeave={() => setHovered(false)}
          onPointerDown={(event) => { if (event.pointerType !== "mouse") { gesture.current = { x: event.clientX, y: event.clientY }; swiped.current = false; } }}
          onPointerCancel={() => { gesture.current = null; }} onPointerUp={(event) => {
            const start = gesture.current; gesture.current = null;
            if (!start || moving) return;
            const distance = event.clientX - start.x;
            if (Math.abs(distance) > 48 && Math.abs(distance) > Math.abs(event.clientY - start.y) * 1.3) {
              swiped.current = true;
              choose((active + (distance < 0 ? 1 : -1) + videos.length) % videos.length);
            }
          }}>
          {videos.map((video, index) => (
            <figure className="proof-orbit-card" data-focus={index === active} key={video.src} role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${videos.length}: ${video.label}`} aria-hidden={compact && index !== active} inert={compact && index !== active}>
              <div className="proof-orbit-media"><ProofVideo video={video} active={index === active} /></div>
              <figcaption id={`proof-caption-${index}`}><span className="proof-orbit-category">{video.label}</span><h3>{video.title}</h3><p>{video.detail}</p></figcaption>
              <button className="proof-orbit-select" type="button" aria-disabled={moving} aria-describedby="proof-orbit-help" aria-label={index !== active ? `Focus ${video.label.toLowerCase()}` : `${paused ? "Resume" : "Pause"} automatic rotation on ${video.label.toLowerCase()}`} onClick={() => {
                if (swiped.current) { swiped.current = false; return; }
                if (moving) return;
                if (index !== active) choose(index);
                else { setFocused(false); setPaused(value => !value); }
              }} />
            </figure>
          ))}
        </div>
      </div>
      <p className="sr-only" id="proof-orbit-help">Select a preview to enlarge it. Select the featured example to pause or resume the sequence. Use left and right arrow keys to change examples.</p>
      <p className="sr-only" aria-live={paused ? "polite" : "off"} aria-atomic="true">In focus: {videos[active]?.label}.</p>
    </section>
  );
}
