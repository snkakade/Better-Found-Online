import { spawn, spawnSync } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const [url, output] = process.argv.slice(2);
if (!url || !output) throw new Error("Usage: node scripts/capture-desktop-preview.mjs <url> <output.webm>");

const port = 9333 + Math.floor(Math.random() * 500);
const profile = await mkdtemp(join(tmpdir(), "bfo-desktop-capture-"));
const frames = join(profile, "frames");
await mkdir(frames);

const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
  "--headless=new",
  "--disable-gpu",
  "--hide-scrollbars",
  "--autoplay-policy=no-user-gesture-required",
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${join(profile, "profile")}`,
  "--window-size=1440,900",
  "--force-device-scale-factor=1",
  "about:blank",
], { stdio: "ignore" });

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let targets;
for (let attempt = 0; attempt < 50; attempt += 1) {
  try {
    targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
    if (targets.some((target) => target.type === "page")) break;
  } catch {}
  await pause(100);
}
const pageTarget = targets?.find((target) => target.type === "page");
if (!pageTarget) throw new Error("Chrome debugging endpoint did not expose a page target");

const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  ws.addEventListener("open", resolve, { once: true });
  ws.addEventListener("error", reject, { once: true });
});

let messageId = 0;
const pending = new Map();
ws.addEventListener("message", ({ data }) => {
  const message = JSON.parse(data);
  if (!message.id || !pending.has(message.id)) return;
  const { resolve, reject } = pending.get(message.id);
  pending.delete(message.id);
  if (message.error) reject(new Error(message.error.message));
  else resolve(message.result);
});
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++messageId;
  pending.set(id, { resolve, reject });
  ws.send(JSON.stringify({ id, method, params }));
});

await send("Page.enable");
await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
await send("Page.navigate", { url });
await pause(5000);
await send("Runtime.evaluate", {
  expression: `(() => {
    const accept = [...document.querySelectorAll('button')].find((button) => /accept optional cookies/i.test(button.textContent || ''));
    if (accept) accept.click();
  })()`,
});
await pause(900);
await send("Runtime.evaluate", { expression: "document.documentElement.style.scrollBehavior='auto'; window.scrollTo(0,0)" });
await pause(800);

const result = await send("Runtime.evaluate", {
  expression: "Math.max(document.body.scrollHeight, document.documentElement.scrollHeight) - innerHeight",
  returnByValue: true,
});
const maxScroll = Math.max(0, result.result.value);
const fps = 12;
const travelSeconds = 18;
const holdSeconds = 1;
const travelFrames = fps * travelSeconds;
const holdFrames = fps * holdSeconds;
const positions = [];
const ease = (t) => t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2;

for (let index = 0; index < travelFrames; index += 1) positions.push(maxScroll * ease(index / (travelFrames - 1)));
for (let index = 0; index < holdFrames; index += 1) positions.push(maxScroll);
for (let index = travelFrames - 1; index >= 0; index -= 1) positions.push(maxScroll * ease(index / (travelFrames - 1)));
for (let index = 0; index < holdFrames; index += 1) positions.push(0);

for (let index = 0; index < positions.length; index += 1) {
  await send("Runtime.evaluate", { expression: `window.scrollTo(0, ${positions[index]})` });
  await pause(1000 / fps);
  const shot = await send("Page.captureScreenshot", { format: "jpeg", quality: 84, fromSurface: true });
  await writeFile(join(frames, `${String(index).padStart(5, "0")}.jpg`), Buffer.from(shot.data, "base64"));
}

ws.close();
chrome.kill("SIGTERM");

const encoded = spawnSync("ffmpeg", [
  "-y", "-framerate", String(fps), "-i", join(frames, "%05d.jpg"),
  "-vf", "scale=960:600:flags=lanczos", "-c:v", "libvpx-vp9", "-crf", "35", "-b:v", "0",
  "-deadline", "good", "-cpu-used", "2", "-pix_fmt", "yuv420p", "-an", output,
], { stdio: "inherit" });

await rm(profile, { recursive: true, force: true });
if (encoded.status !== 0) throw new Error("ffmpeg failed to encode the preview");
