import { mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Deterministic derivatives of existing screen recordings, not generated art.
// H.264 + fast-start works on iOS; every poster is frame zero of its encoded MP4.
export const previewSources = [
  ["charterx", "service-pages/websites/charterx.mp4"],
  ["say-vanilla", "service-pages/websites/say-vanilla.mp4"],
  ["tech-sales", "service-pages/websites/tech-sales.mp4"],
  ["dr-shweta", "service-pages/websites/dr-shweta.mp4"],
  ["hello-honey-bunny", "service-pages/websites/hello-honey-bunny.webm"],
  ["say-vanilla-phone", "work/say-vanilla-mobile.webm"],
  ["charterx-tablet", "work/charterx-tablet.webm"],
  ["tech-sales-desktop", "work/tech-sales-desktop-smooth.mp4"],
  ["tech-sales-tablet", "work/tech-sales-tablet-smooth.webm"],
  ["tech-sales-phone", "work/tech-sales-mobile-smooth.webm"],
];

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const output = resolve("public/assets/website-previews");
  mkdirSync(output, { recursive: true });
  const requested = process.argv[2];
  for (const [name, input] of previewSources) {
    if (requested && requested !== name) continue;
    const mp4 = resolve(output, `${name}.mp4`);
    execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-n", "-i", resolve("public/assets", input), "-an", "-vf", "scale=w='min(960,iw)':h='min(960,ih)':force_original_aspect_ratio=decrease:force_divisible_by=2,fps=24", "-c:v", "libx264", "-preset", "fast", "-crf", "26", "-profile:v", "main", "-level:v", "3.1", "-pix_fmt", "yuv420p", "-color_range", "tv", "-movflags", "+faststart", mp4]);
    execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-n", "-i", mp4, "-frames:v", "1", "-q:v", "3", resolve(output, `${name}.jpg`)]);
    console.log(`Prepared ${name}`);
  }
}
