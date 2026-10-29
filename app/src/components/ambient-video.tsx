import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "@phosphor-icons/react";
import "@/search-ads-video.css";

type AmbientVideoProps = {
  src: string;
  poster: string;
  label: string;
  width: number;
  height: number;
};

/** Illustrative footage only: never presented as campaign performance evidence. */
export function AmbientVideo({ src, poster, label, width, height }: AmbientVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const preference = useRef<"auto" | "paused" | "playing">("auto");
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    const syncPlayback = () => {
      const allowed =
        preference.current === "playing" || (preference.current === "auto" && !motion.matches);
      if (visible && !document.hidden && allowed && !video.error) {
        void video.play().catch(() => setPlaying(false));
      } else {
        video.pause();
      }
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        syncPlayback();
      },
      { threshold: 0.15 },
    );
    const onMotionChange = () => {
      preference.current = "auto";
      syncPlayback();
      if (motion.matches && video.readyState > 0) video.currentTime = 0;
    };
    observer.observe(video);
    motion.addEventListener("change", onMotionChange);
    document.addEventListener("visibilitychange", syncPlayback);
    return () => {
      observer.disconnect();
      motion.removeEventListener("change", onMotionChange);
      document.removeEventListener("visibilitychange", syncPlayback);
      video.pause();
    };
  }, [src]);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      preference.current = "playing";
      if (video.error) video.load();
      void video.play().catch(() => setPlaying(false));
    } else {
      preference.current = "paused";
      video.pause();
    }
  };

  return (
    <div className={`service-video${width === height ? " service-video--square" : ""}`}>
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            width={width}
            height={height}
            muted
            loop
            playsInline
            preload="none"
            aria-label={label}
            onPlaying={() => { setPlaying(true); setFailed(false); }}
            onPause={() => setPlaying(false)}
            onError={() => { setFailed(true); setPlaying(false); }}
          />
          <button
            className="service-video-toggle"
            type="button"
            aria-label={`${failed ? "Retry" : playing ? "Pause" : "Play"} ${label}`}
            onClick={togglePlayback}
          >
            {playing ? (
              <Pause size={18} weight="fill" aria-hidden="true" />
            ) : (
              <Play size={18} weight="fill" aria-hidden="true" />
            )}
          </button>
    </div>
  );
}
