import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

// The supplied edit ends with 3.1 seconds of black (black_start=11.8).
// Keep all picture content and remove only that dead tail from the web loop.
const output = resolve("public/assets/creative-work/finished-interview-loop.mp4");
execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-n", "-i", resolve("public/assets/creative-work/finished-interview-edit.mp4"), "-t", "11.733333", "-an", "-c:v", "libx264", "-preset", "fast", "-crf", "24", "-profile:v", "main", "-pix_fmt", "yuv420p", "-movflags", "+faststart", output]);
execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-n", "-i", output, "-frames:v", "1", "-q:v", "3", resolve("public/assets/creative-work/finished-interview-loop-poster.jpg")]);
