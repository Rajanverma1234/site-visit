#!/usr/bin/env node
/**
 * Scans /public/images and writes data/image-meta.json with each image's real
 * width/height and a tiny base64 blur placeholder (used by next/image `placeholder="blur"`).
 *
 * Run after adding or replacing photos:   npm run images:meta
 */
import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve("public/images");
const OUT = path.resolve("data/image-meta.json");
const EXT = /\.(jpe?g|png|webp|avif)$/i;

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else if (EXT.test(e.name)) out.push(p);
  }
  return out;
}

const meta = {};
for (const file of (await walk(ROOT)).sort()) {
  const src = "/" + path.relative(path.resolve("public"), file).split(path.sep).join("/");
  const img = sharp(file);
  const { width, height } = await img.metadata();
  const blur = await img.clone().resize(16, 16, { fit: "inside" }).webp({ quality: 40 }).toBuffer();
  meta[src] = { width, height, blurDataURL: `data:image/webp;base64,${blur.toString("base64")}` };
}
await writeFile(OUT, JSON.stringify(meta, null, 2) + "\n");
console.log(`image-meta: ${Object.keys(meta).length} images → ${path.relative(process.cwd(), OUT)}`);
