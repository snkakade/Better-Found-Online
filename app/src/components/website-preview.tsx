"use client";

import { useEffect, useRef } from "react";
import { useAutoplayVideo } from "@/hooks/use-autoplay-video";
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
  const media = websitePreviewMedia(src);
  useAutoplayVideo(videoRef, { src: media.src, playbackRate });

  useEffect(() => {
    const video = videoRef.current;
    const frame = root.current;
    if (!video || !frame) return;
    let disposed = false;
    let videoFrame: number | undefined;
    let paintFrame = 0;
    const showPaintedFrame = () => {
      if (disposed || video.readyState < 2 || !video.videoWidth) return;
      if (video.requestVideoFrameCallback) {
        if (videoFrame !== undefined) video.cancelVideoFrameCallback(videoFrame);
        videoFrame = video.requestVideoFrameCallback(() => { if (!disposed) frame.dataset.ready = "true"; });
      } else {
        paintFrame = requestAnimationFrame(() => { if (!disposed && !video.paused) frame.dataset.ready = "true"; });
      }
    };
    const onError = () => { frame.dataset.ready = "false"; video.pause(); };
    video.addEventListener("playing", showPaintedFrame);
    video.addEventListener("error", onError);
    return () => {
      disposed = true;
      if (videoFrame !== undefined) video.cancelVideoFrameCallback(videoFrame);
      cancelAnimationFrame(paintFrame);
      video.removeEventListener("playing", showPaintedFrame);
      video.removeEventListener("error", onError);
    };
  }, [media.src]);

  return <span ref={root} className={`website-preview website-preview--${fit}`} data-ready="false" role="group" aria-label={label}>
    <img className="website-preview-poster" src={media.poster} alt="" loading="eager" decoding="async" />
    <video ref={video => { videoRef.current = video; registerVideo?.(video); }} src={media.src} poster={media.poster} autoPlay muted loop playsInline preload="metadata" aria-hidden="true" />
  </span>;
}
