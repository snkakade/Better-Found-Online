"use client";

import { Play } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { websitePreviewMedia } from "@/website-preview-media";
import "./website-preview.css";

export function WebsitePreview({ src, label, playbackRate = .78, registerVideo, fit = "contain" }: {
  src: string;
  label: string;
  playbackRate?: number;
  fit?: "contain" | "cover";
  registerVideo?: (video: HTMLVideoElement | null) => void;
}) {
  const root = useRef<HTMLSpanElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const manualPlay = useRef(false);
  const [action, setAction] = useState<"play" | "retry" | null>("play");
  const media = websitePreviewMedia(src);

  useEffect(() => {
    const video = videoRef.current;
    const frame = root.current;
    if (!video || !frame) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    let disposed = false;
    let videoFrame: number | undefined;
    let paintFrame = 0;
    video.muted = true;
    video.defaultMuted = true;
    video.playbackRate = playbackRate;
    const showPaintedFrame = () => {
      if (disposed || video.readyState < 2 || !video.videoWidth) return;
      if (video.requestVideoFrameCallback) {
        if (videoFrame !== undefined) video.cancelVideoFrameCallback(videoFrame);
        videoFrame = video.requestVideoFrameCallback(() => { if (!disposed) frame.dataset.ready = "true"; });
      } else {
        paintFrame = requestAnimationFrame(() => { if (!disposed && !video.paused) frame.dataset.ready = "true"; });
      }
    };
    const sync = () => {
      if (visible && !document.hidden && (!reduce.matches || manualPlay.current) && !video.error) void video.play().catch(error => {
        if (!disposed && error.name !== "AbortError") setAction("play");
      });
      else video.pause();
      if (visible && reduce.matches && !manualPlay.current) setAction("play");
    };
    const onPlaying = () => { setAction(null); showPaintedFrame(); };
    const onError = () => { frame.dataset.ready = "false"; setAction("retry"); video.pause(); };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, { rootMargin: "160px 0px", threshold: .01 });
    observer.observe(frame);
    video.addEventListener("playing", onPlaying);
    video.addEventListener("error", onError);
    reduce.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    // A normal touch gesture can resume muted media on restrictive mobile modes.
    document.addEventListener("pointerup", sync, { passive: true });
    return () => {
      disposed = true;
      observer.disconnect();
      video.pause();
      if (videoFrame !== undefined) video.cancelVideoFrameCallback(videoFrame);
      cancelAnimationFrame(paintFrame);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("error", onError);
      reduce.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
      document.removeEventListener("pointerup", sync);
    };
  }, [media.src, playbackRate]);

  return <span ref={root} className={`website-preview website-preview--${fit}`} data-ready="false" role="group" aria-label={label}>
    <img className="website-preview-poster" src={media.poster} alt="" loading="eager" decoding="async" />
    <video ref={video => { videoRef.current = video; registerVideo?.(video); }} src={media.src} poster={media.poster} muted loop playsInline preload="metadata" aria-hidden="true" />
    {action && <button className="website-preview-play" type="button" aria-label={`${action === "retry" ? "Retry" : "Play"} ${label}`} onClick={() => {
      const video = videoRef.current;
      if (!video) return;
      manualPlay.current = true;
      if (video.error || video.readyState === 0) video.load();
      void video.play().catch(() => setAction(video.error ? "retry" : "play"));
    }}><Play size={20} weight="fill" aria-hidden="true" /><span>{action === "retry" ? "Retry video" : "Play video"}</span></button>}
  </span>;
}
