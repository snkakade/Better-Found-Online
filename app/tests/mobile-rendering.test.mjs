import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { previewSources } from "../scripts/prepare-website-previews.mjs";

const source = path => readFileSync(new URL(`../src/${path}`, import.meta.url), "utf8");
const mobile = source("mobile-refinements.css");
const preview = source("components/website-preview.tsx");

test("mobile homepage content does not depend on reversible scroll reveals", () => {
  assert.match(source("routes/index.tsx"), /if \(reduced \|\| motionPaused \|\| window\.matchMedia\("\(max-width: 900px\)"\)\.matches\) return/);
  assert.match(mobile, /home-page :is\([^}]+opacity: 1 !important;[^}]+visibility: visible !important/s);
  assert.match(mobile, /home-page \.story-stage \{ display: none/);
  assert.match(mobile, /home-page \.story-beat-media \{ display: block/);
  assert.match(mobile, /home-page \.brand-tunnel \{ position: absolute/);
});

test("mobile services use native details instead of a cancellable height animation", () => {
  assert.match(source("components/services-accordion.tsx"), /motionDisabled \|\| window\.matchMedia\("\(max-width: 900px\)"\)\.matches/);
  assert.match(mobile, /service:not\(\[open\]\) > \.service-content \{ display: none/);
  assert.match(mobile, /insight:not\(\[open\]\) > \.article-body \{ display: none/);
});

test("mobile project media has a definite aspect ratio and a real video play/retry path", () => {
  assert.match(mobile, /home-page \.reel-image \{[^}]+aspect-ratio: 16 \/ 10/);
  assert.match(preview, /requestVideoFrameCallback/);
  assert.match(preview, /muted loop playsInline preload="metadata"/);
  assert.match(preview, /useState<"play" \| "retry" \| null>\("play"\)/);
  assert.match(preview, /video\.error \|\| video\.readyState === 0\) video\.load\(\)/);
  assert.match(preview, /video\.play\(\)/);
  assert.doesNotMatch(preview, /failed \? <img/);
  assert.match(source("components/website-preview.css"), /data-ready="true"\]\s*> video \{ opacity: 1/);
});

test("creative mobile playback never waits for a hidden video half to buffer", () => {
  const creative = source("components/creative-story-components.tsx");
  assert.match(creative, /!compactVideo\.matches && videoBottom\.readyState < 2/);
  assert.match(creative, /if \(!compactVideo\.matches\) videoBottom\.load\(\)/);
  assert.match(creative, /handleVideoPlay\.current =/);
  assert.doesNotMatch(creative, /readyCount < 2/);
  assert.doesNotMatch(source("components/ambient-video.tsx"), /failed \? \(/);
  assert.doesNotMatch(source("components/creative-proof-reel/creative-proof-reel.tsx"), /return failed/);
});

test("the creative showcase loop excludes the source edit's three-second black tail", () => {
  const clip = fileURLToPath(new URL("../public/assets/creative-work/finished-interview-loop.mp4", import.meta.url));
  const duration = +execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", clip], { encoding: "utf8" });
  assert.ok(duration > 11.6 && duration < 11.8);
  assert.match(source("routes/creative-production.tsx"), /finished-interview-loop\.mp4/);
});

for (const [name] of previewSources) {
  test(`${name}: iPhone-compatible H.264 and an exact encoded-frame loading cover`, () => {
    const clip = new URL(`../public/assets/website-previews/${name}.mp4`, import.meta.url);
    const poster = new URL(`../public/assets/website-previews/${name}.jpg`, import.meta.url);
    const info = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=codec_name,profile,pix_fmt,width,height,r_frame_rate", "-of", "json", fileURLToPath(clip)], { encoding: "utf8" })).streams[0];
    assert.equal(info.codec_name, "h264");
    assert.equal(info.profile, "Main");
    assert.equal(info.pix_fmt, "yuv420p");
    assert.ok(info.width <= 960 && info.height <= 960);
    assert.equal(info.r_frame_rate, "24/1");
    assert.ok(statSync(clip).size < 4 * 1024 * 1024);
    const jpeg = execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-i", fileURLToPath(clip), "-frames:v", "1", "-q:v", "3", "-f", "image2pipe", "pipe:1"]);
    assert.deepEqual(jpeg, readFileSync(poster));
  });
}
