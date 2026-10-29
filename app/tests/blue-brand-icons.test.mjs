import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const app = fileURLToPath(new URL('../', import.meta.url));
const read = (name) => readFileSync(path.join(app, name));
const brand = 'public/assets/brand/';
const version = 'blue-20261029';
const pngSize = (buffer) => {
  assert.equal(buffer.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  return [buffer.readUInt32BE(16), buffer.readUInt32BE(20)];
};

test('the blue master preserves the exact original vector mark and exports true 2048 px', () => {
  const original = read(`${brand}mark-light.svg`).toString();
  const master = read(`${brand}profile-blue.svg`).toString();
  const markPaths = (svg) => Array.from(svg.matchAll(/<path d="([^"]+)"/g), (match) => match[1]);
  assert.equal(markPaths(original).length, 3);
  assert.deepEqual(markPaths(master), markPaths(original));
  assert.match(master, /stop-color="#20309A"/);
  assert.match(master, /stroke="#FFFFFF"/);
  assert.deepEqual(pngSize(read(`${brand}profile-blue-2048.png`)), [2048, 2048]);
  for (const size of [16, 32, 48, 180, 192, 512]) {
    assert.deepEqual(pngSize(read(`${brand}icon-${size}.png`)), [size, size]);
  }
});

test('the favicon contains six valid native-size PNG frames', () => {
  const ico = read('public/favicon.ico');
  assert.equal(ico.readUInt16LE(0), 0);
  assert.equal(ico.readUInt16LE(2), 1);
  assert.equal(ico.readUInt16LE(4), 6);
  for (const [index, size] of [16, 32, 48, 64, 128, 256].entries()) {
    const entry = 6 + index * 16;
    assert.equal(ico[entry] || 256, size);
    assert.equal(ico[entry + 1] || 256, size);
    const length = ico.readUInt32LE(entry + 8);
    const offset = ico.readUInt32LE(entry + 12);
    assert.ok(offset + length <= ico.length);
    assert.deepEqual(pngSize(ico.subarray(offset, offset + length)), [size, size]);
  }
  assert.deepEqual(read(`${brand}favicon.ico`), ico);
  assert.deepEqual(read('public/console/assets/images/favicon.ico'), ico);
});

test('console icons match the website and maskable icons have separate safe-area artwork', () => {
  for (const [source, destination] of [
    ['icon-32.png', 'favicon-32.png'], ['icon-48.png', 'favicon-48.png'],
    ['icon-180.png', 'apple-touch-icon.png'], ['icon-192.png', 'icon-192.png'],
    ['icon-512.png', 'icon-512.png'], ['maskable.png', 'maskable.png'],
    ['profile-blue.svg', 'favicon.svg'],
  ]) assert.deepEqual(read(`${brand}${source}`), read(`public/console/assets/images/${destination}`));
  assert.match(read(`${brand}maskable-blue.svg`).toString(), /translate\(540 540\) scale\(\.84\) translate\(-540 -540\)/);
  assert.deepEqual(pngSize(read(`${brand}maskable.png`)), [512, 512]);
  assert.notDeepEqual(read(`${brand}maskable.png`), read(`${brand}icon-512.png`));
});

test('both applications reference blue versioned icons and separate any/maskable purposes', () => {
  for (const file of ['public/site.webmanifest', 'public/console/manifest.webmanifest']) {
    const manifest = JSON.parse(read(file));
    assert.equal(manifest.theme_color, '#20309A');
    assert.equal(manifest.background_color, '#20309A');
    assert.equal(manifest.icons.filter((icon) => icon.purpose === 'maskable').length, 1);
    for (const icon of manifest.icons) {
      const url = new URL(icon.src, 'https://example.test');
      assert.equal(url.searchParams.get('v'), version);
      assert.ok(read(`public${url.pathname}`).length > 0);
      assert.ok(['any', 'maskable'].includes(icon.purpose));
    }
  }
  for (const [file, expression] of [
    ['src/routes/__root.tsx', /href:"([^"]+\?v=blue-20261029)"/g],
    ['public/console/shell.html', /href="([^"]+\?v=blue-20261029)"/g],
  ]) {
    const source = read(file).toString();
    const urls = Array.from(source.matchAll(expression), (match) => match[1]);
    assert.ok(urls.length >= 6);
    for (const href of urls) assert.ok(read(`public${new URL(href, 'https://example.test').pathname}`).length > 0);
    assert.match(source, /image\/svg\+xml/);
  }
  assert.equal(JSON.parse(read('src/app-meta.json')).favicon_url, `/assets/brand/icon-32.png?v=${version}`);
  const sw = read('public/console/sw.js').toString();
  assert.match(sw, /bfo-console-v7-blue-brand/);
  assert.match(sw, /\/console\/assets\/images\/maskable.png/);
});
