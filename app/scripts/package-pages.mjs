import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const appRoot = resolve(import.meta.dirname, "..");
const clientDir = resolve(appRoot, "dist/client");
const serverEntry = resolve(appRoot, "dist/server/server.js");
const pagesDir = resolve(appRoot, "dist/pages-ssr");

await rm(pagesDir, { recursive: true, force: true });
await mkdir(pagesDir, { recursive: true });
await cp(clientDir, pagesDir, { recursive: true });
await cp(serverEntry, resolve(pagesDir, "_worker.js"));
await writeFile(
  resolve(pagesDir, "_routes.json"),
  `${JSON.stringify({ version: 1, include: ["/*"], exclude: [] }, null, 2)}\n`,
);

console.log(`Cloudflare Pages bundle prepared at ${pagesDir}`);
