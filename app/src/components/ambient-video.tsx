import { useRef } from "react";
import { useAutoplayVideo } from "@/hooks/use-autoplay-video";
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
  useAutoplayVideo(videoRef, { src });
  return (
    <div className={`service-video${width === height ? " service-video--square" : ""}`}>
      <video ref={videoRef} src={src} poster={poster} width={width} height={height}
        autoPlay muted loop playsInline preload="metadata" aria-label={label} />
    </div>
  );
}
