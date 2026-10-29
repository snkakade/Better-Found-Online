import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { searchAdsMedia } from "../src/search-ads-media.ts";

const durations = { search: 7.9, advertising: 8.4, customer: 9.6 };

for (const [name, clip] of Object.entries(searchAdsMedia)) {
  test(`${name}: publishes a short, silent H.264 cut with its own first-frame poster`, () => {
    const path = new URL(`../public${clip.src}`, import.meta.url);
    assert.ok(existsSync(path));
    assert.ok(existsSync(new URL(`../public${clip.poster}`, import.meta.url)));
    const probe = JSON.parse(
      execFileSync(
        "ffprobe",
        ["-v", "error", "-show_streams", "-show_format", "-of", "json", fileURLToPath(path)],
        { encoding: "utf8" },
      ),
    );
    assert.equal(probe.streams.length, 1, "no audio or extra tracks");
    assert.equal(probe.streams[0].codec_name, "h264");
    assert.equal(probe.streams[0].pix_fmt, "yuv420p");
    assert.equal(probe.streams[0].width, clip.width);
    assert.equal(probe.streams[0].height, clip.height);
    assert.ok(Math.abs(Number(probe.format.duration) - durations[name]) < 0.05);
    assert.ok(statSync(path).size < 1.5 * 1024 * 1024);
  });
}

test("the three clips and posters stay below a 3 MiB combined budget", () => {
  const bytes = Object.values(searchAdsMedia).reduce(
    (total, clip) =>
      total +
      statSync(new URL(`../public${clip.src}`, import.meta.url)).size +
      statSync(new URL(`../public${clip.poster}`, import.meta.url)).size,
    0,
  );
  assert.ok(bytes < 3 * 1024 * 1024);
});
