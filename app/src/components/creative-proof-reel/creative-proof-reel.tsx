"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "@phosphor-icons/react";
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
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    const sync = () => {
      if (active && visible && !document.hidden && !motion.matches && !element.error) {
        void element.play().catch(() => undefined);
      } else element.pause();
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
  return failed
    ? <img src={video.poster} alt={`${video.label} before and after preview`} width="540" height="960" />
    : <video ref={ref} src={video.src} poster={video.poster} width="540" height="960" muted loop playsInline preload="metadata" aria-label={`${video.label} before and after`} onError={() => setFailed(true)} />;
}

/** Preserve redesign: existing Outfit, white/royal blue, tomato controls, sharp geometry.
 * Design variance 7 / motion intensity 7 / visual density 3. Motion gives each real edit equal prominence.
 */
export function CreativeProofReel({ videos }: { videos: CreativeProofVideo[] }) {
  const stage = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const { active, moving, compact, reduced, select } = useProofOrbit(stage, videos.length, paused || hovered);
  if (!videos.length) return null;
  const choose = (index: number) => { setPaused(true); select(index); };
  return (
    <section className="creative-proof section-pad proof-orbit" id="edit-transformations" aria-labelledby="creative-proof-title" aria-roledescription="carousel"
      onFocusCapture={(event) => { if (!(event.target as HTMLElement).closest("[data-rotation-toggle]")) setPaused(true); }}>
      <header className="creative-proof-header proof-orbit-header">
        <div><p className="eyebrow">Before / after</p><h2 id="creative-proof-title">See what the edit changes.</h2><p>Raw footage becomes clear, paced, platform-ready content.</p></div>
        {!reduced && videos.length > 1 && <button className="proof-orbit-toggle" type="button" data-rotation-toggle aria-controls="proof-orbit-stage" onClick={() => setPaused(!paused)}>
          {paused ? <Play size={18} weight="fill" aria-hidden="true" /> : <Pause size={18} weight="fill" aria-hidden="true" />}
          <span>{paused ? "Resume rotation" : "Pause rotation"}</span>
        </button>}
      </header>
      <div className="proof-orbit-stage" id="proof-orbit-stage" ref={stage} data-moving={moving} data-active={active}
        onPointerEnter={(event) => { if (event.pointerType === "mouse") setHovered(true); }} onPointerLeave={() => setHovered(false)}>
        {videos.map((video, index) => (
          <figure className="proof-orbit-card" data-focus={index === active} key={video.src} role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${videos.length}: ${video.label}`} aria-hidden={compact && index !== active} inert={compact && index !== active}>
            <div className="proof-orbit-media"><ProofVideo video={video} active={index === active} /></div>
            <figcaption><span className="proof-orbit-category">{video.label}</span><h3>{video.title}</h3><p>{video.detail}</p></figcaption>
            <button className="proof-orbit-select" type="button" disabled={moving} aria-label={index === active ? `Keep ${video.label.toLowerCase()} in focus` : `Focus ${video.label.toLowerCase()}`} onClick={() => choose(index)} />
          </figure>
        ))}
      </div>
      <div className="proof-orbit-choices" role="group" aria-label="Choose an editing example" onKeyDown={(event) => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        event.preventDefault();
        if (moving) return;
        const index = (active + (event.key === "ArrowRight" ? 1 : -1) + videos.length) % videos.length;
        choose(index);
        event.currentTarget.querySelectorAll<HTMLButtonElement>("button")[index]?.focus();
      }}>
        {videos.map((video, index) => <button type="button" key={video.src} aria-pressed={active === index} aria-controls="proof-orbit-stage" aria-label={`Show ${video.label.toLowerCase()}`} disabled={moving} onClick={() => choose(index)}>{video.navLabel || video.label}</button>)}
      </div>
      <p className="sr-only" aria-live={paused ? "polite" : "off"} aria-atomic="true">In focus: {videos[active]?.label}.</p>
    </section>
  );
}
