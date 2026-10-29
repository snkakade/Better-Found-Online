import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Deterministic exports from the original logo paths. Requires macOS sips.
const app = fileURLToPath(new URL('../', import.meta.url));
const brand = path.join(app, 'public/assets/brand');
const consoleImages = path.join(app, 'public/console/assets/images');
const scratch = mkdtempSync(path.join(tmpdir(), 'bfo-blue-icons-'));
const master = readFileSync(path.join(brand, 'profile-blue.svg'), 'utf8');
const maskable = master.replace(
  '<g id="brand-mark"',
  '<g transform="translate(540 540) scale(.84) translate(-540 -540)"><g id="brand-mark"',
).replace('  </g>\n</svg>', '  </g></g>\n</svg>');

mkdirSync(consoleImages, { recursive: true });
writeFileSync(path.join(brand, 'maskable-blue.svg'), maskable);

function render(svg, size, destination) {
  const source = path.join(scratch, `render-${size}.svg`);
  writeFileSync(source, svg.replace('width="2048" height="2048"', `width="${size}" height="${size}"`));
  execFileSync('/usr/bin/sips', ['-s', 'format', 'png', source, '--out', destination], { stdio: 'pipe' });
}

render(master, 2048, path.join(brand, 'profile-blue-2048.png'));
const iconSizes = [16, 32, 48, 64, 128, 256];
const frames = iconSizes.map((size) => {
  const destination = path.join(scratch, `icon-${size}.png`);
  render(master, size, destination);
  if ([16, 32, 48].includes(size)) copyFileSync(destination, path.join(brand, `icon-${size}.png`));
  return readFileSync(destination);
});
for (const size of [180, 192, 512]) render(master, size, path.join(brand, `icon-${size}.png`));
render(maskable, 512, path.join(brand, 'maskable.png'));

// ICO container with PNG frames: no lossy conversion and real 16–256 px sizes.
const header = Buffer.alloc(6 + 16 * frames.length);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(frames.length, 4);
let offset = header.length;
frames.forEach((frame, index) => {
  const entry = 6 + 16 * index;
  const size = iconSizes[index] === 256 ? 0 : iconSizes[index];
  header[entry] = size;
  header[entry + 1] = size;
  header.writeUInt16LE(1, entry + 4);
  header.writeUInt16LE(32, entry + 6);
  header.writeUInt32LE(frame.length, entry + 8);
  header.writeUInt32LE(offset, entry + 12);
  offset += frame.length;
});
writeFileSync(path.join(app, 'public/favicon.ico'), Buffer.concat([header, ...frames]));

for (const [source, destination] of [
  ['icon-32.png', 'favicon-32.png'],
  ['icon-48.png', 'favicon-48.png'],
  ['icon-180.png', 'apple-touch-icon.png'],
  ['icon-192.png', 'icon-192.png'],
  ['icon-512.png', 'icon-512.png'],
  ['maskable.png', 'maskable.png'],
  ['profile-blue.svg', 'favicon.svg'],
]) copyFileSync(path.join(brand, source), path.join(consoleImages, destination));
copyFileSync(path.join(app, 'public/favicon.ico'), path.join(consoleImages, 'favicon.ico'));
copyFileSync(path.join(app, 'public/favicon.ico'), path.join(brand, 'favicon.ico'));

const kit = path.join(scratch, 'bfo-blue-brand-kit.zip');
execFileSync('/usr/bin/zip', ['-j', '-q', kit, ...[
  'BLUE-BRAND-README.md', 'profile-blue-2048.png', 'profile-blue.svg',
  'favicon.ico', 'icon-16.png', 'icon-32.png', 'icon-48.png', 'icon-180.png',
  'icon-192.png', 'icon-512.png', 'maskable.png', 'maskable-blue.svg',
].map((name) => path.join(brand, name))], { stdio: 'pipe' });
copyFileSync(kit, path.join(brand, 'bfo-blue-brand-kit.zip'));

console.log('Exported 2048 px profile image, SVG master, multi-size favicon, Apple/PWA and console icons, and download kit.');
