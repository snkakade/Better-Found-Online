import { useEffect, type RefObject } from "react";

/** Muted public-site footage: no player chrome, no offscreen playback.
 * Retry after a normal gesture or connection recovery, never reload healthy media.
 * Browser autoplay restrictions and reduced-motion preferences still apply. */
export function useAutoplayVideo(
  ref: RefObject<HTMLVideoElement | null>,
  { src, enabled = true, playbackRate = 1 }: { src: string; enabled?: boolean; playbackRate?: number },
) {
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    let disposed = false;
    video.muted = true;
    video.defaultMuted = true;
    video.controls = false;
    video.playsInline = true;
    video.playbackRate = playbackRate;
    const sync = () => {
      const allowed = enabled && visible && !document.hidden && !motion.matches;
      video.autoplay = allowed;
      if (allowed && !video.error) void video.play().catch(() => {
        // Low Power Mode can refuse autoplay. Retry after a normal gesture
        // without introducing player UI or replacing the video with a photo.
      });
      else video.pause();
    };
    const resume = () => {
      if (disposed) return;
      if (enabled && visible && !document.hidden && !motion.matches && video.error) video.load();
      sync();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    }, { rootMargin: "160px 0px", threshold: .01 });
    observer.observe(video);
    video.addEventListener("canplay", sync);
    motion.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    document.addEventListener("pointerup", resume, { passive: true });
    window.addEventListener("online", resume);
    sync();
    return () => {
      disposed = true;
      observer.disconnect();
      video.pause();
      video.removeEventListener("canplay", sync);
      motion.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
      document.removeEventListener("pointerup", resume);
      window.removeEventListener("online", resume);
    };
  }, [ref, src, enabled, playbackRate]);
}
