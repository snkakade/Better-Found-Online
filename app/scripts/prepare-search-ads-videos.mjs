import { mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

// Reviewed source footage. Keep the originals untouched and only publish these cuts.
const sourceDirectory = resolve(process.argv[2] || "/Users/mac2/Downloads");
const outputDirectory = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../public/assets/search-ads",
);
const clips = [
  {
    source: "4549682-hd_1920_1080_30fps.mp4",
    name: "google-search",
    start: 2.7,
    duration: 7.9,
    filter: "scale=1280:720,fps=24,setsar=1",
  },
  {
    source: "6561560-uhd_3840_2160_25fps.mp4",
    name: "ad-spend-review",
    start: 1.4,
    duration: 8.4,
    filter: "scale=1280:720,fps=25,setsar=1",
  },
  {
    source: "7350953-uhd_2160_4096_25fps.mp4",
    name: "customer-search",
    start: 2,
    duration: 9.6,
    // The tablet stays inside this square throughout the reviewed segment.
    // Exclude the unrelated websites shown later in the original recording.
    filter: "crop=2160:2160:0:1400,scale=900:900,fps=25,setsar=1",
  },
];

mkdirSync(outputDirectory, { recursive: true });
for (const clip of clips) {
  const output = join(outputDirectory, `${clip.name}.mp4`);
  execFileSync(
    "ffmpeg",
    [
      "-nostdin",
      "-hide_banner",
      "-loglevel",
      "error",
      "-y",
      "-ss",
      String(clip.start),
      "-i",
      join(sourceDirectory, clip.source),
      "-t",
      String(clip.duration),
      "-an",
      "-map_metadata",
      "-1",
      "-vf",
      clip.filter,
      "-c:v",
      "libx264",
      "-preset",
      "slow",
      "-crf",
      "24",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      output,
    ],
    { stdio: "inherit" },
  );
  // A real first frame from the encoded cut, also used for reduced motion.
  execFileSync(
    "ffmpeg",
    [
      "-nostdin",
      "-hide_banner",
      "-loglevel",
      "error",
      "-y",
      "-i",
      output,
      "-frames:v",
      "1",
      "-q:v",
      "3",
      join(outputDirectory, `${clip.name}-poster.jpg`),
    ],
    { stdio: "inherit" },
  );
  console.log(`${clip.name}: ${clip.start}s to ${Number((clip.start + clip.duration).toFixed(2))}s`);
}
