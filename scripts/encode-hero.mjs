/**
 * Hero sequence encoder.
 *
 * Turns the raw 300-frame PNG sequence (~220 MB) into the web-ready WebP tiers
 * the hero component consumes, plus a manifest describing them.
 *
 *   node scripts/encode-hero.mjs --src <dir-of-pngs> --out public/hero
 *
 * Why WebP and not AVIF: measured on this footage, AVIF at matched width is
 * only ~15% smaller but roughly 3x slower to encode and materially slower to
 * decode. A scroll sequence decodes 150 images before it can run, so decode
 * time is the binding constraint, not bytes. WebP wins.
 *
 * Why the frame counts differ per tier: ImageBitmap pins width*height*4 bytes
 * of decoded pixels per frame. At 480x853 that is 1.64 MB each, so 300 frames
 * would hold ~491 MB of RAM in a single tab. Frame count is a memory budget,
 * not a quality setting.
 */

import sharp from 'sharp';
import { mkdir, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';

/** @typedef {{ id: string; width: number; quality: number; stride: number; note: string }} Tier */

/**
 * Tiers trade frame count against resolution at a fixed memory ceiling, and
 * for a scrubbed sequence smoothness beats sharpness — so width is held at 480
 * and the tiers differ by frame count.
 *
 * 480x853 pins 1.64 MB per frame:
 *   desktop  150 frames -> 246 MB   (at the 250 MB budget in CLAUDE.md)
 *   tablet    75 frames -> 123 MB
 *   mobile     1 frame  ->   2 MB
 *
 * 720px was the original spec and is wrong: 3.69 MB/frame x 150 = 553 MB, more
 * than double the budget. The ceiling is memory, not bandwidth.
 *
 * @type {Tier[]}
 */
const TIERS = [
  { id: 'desktop', width: 480, quality: 70, stride: 2, note: 'full scrub, >=1000px viewports' },
  { id: 'tablet', width: 480, quality: 66, stride: 4, note: 'reduced scrub, 768-999px' },
  { id: 'mobile', width: 480, quality: 78, stride: 0, note: 'poster only — final frame' },
];

const BYTES_PER_PIXEL = 4;

const { values } = parseArgs({
  options: {
    src: { type: 'string' },
    out: { type: 'string', default: 'public/hero' },
  },
});

if (!values.src) {
  console.error('usage: node scripts/encode-hero.mjs --src <dir-of-pngs> [--out public/hero]');
  process.exit(1);
}

/**
 * Selects which source frames a tier uses. A stride of 0 means poster-only:
 * just the last frame, which is where the subject faces the camera.
 */
function selectFrames(files, stride) {
  if (stride === 0) return [files[files.length - 1]];
  const picked = files.filter((_, i) => i % stride === 0);
  const last = files[files.length - 1];
  if (picked[picked.length - 1] !== last) picked.push(last);
  return picked;
}

async function encodeTier(tier, files, srcDir, outDir) {
  const dir = path.join(outDir, tier.id);
  await mkdir(dir, { recursive: true });

  const frames = selectFrames(files, tier.stride);
  let bytes = 0;
  let height = 0;

  for (const [i, file] of frames.entries()) {
    const buf = await sharp(path.join(srcDir, file))
      .resize({ width: tier.width, kernel: 'lanczos3' })
      .webp({ quality: tier.quality, effort: 6, smartSubsample: true })
      .toBuffer();

    await writeFile(path.join(dir, `${String(i).padStart(3, '0')}.webp`), buf);
    bytes += buf.length;

    if (!height) height = (await sharp(buf).metadata()).height ?? 0;
  }

  const decodedMB = (tier.width * height * BYTES_PER_PIXEL * frames.length) / 1048576;

  return {
    id: tier.id,
    note: tier.note,
    width: tier.width,
    height,
    frames: frames.length,
    stride: tier.stride,
    pattern: `/hero/${tier.id}/{i}.webp`,
    payloadKB: Math.round(bytes / 1024),
    decodedMB: Math.round(decodedMB),
  };
}

const srcDir = path.resolve(values.src);
const outDir = path.resolve(values.out);

const files = (await readdir(srcDir)).filter((f) => /\.png$/i.test(f)).sort();
if (files.length === 0) {
  console.error(`no PNGs found in ${srcDir}`);
  process.exit(1);
}

console.log(`source: ${files.length} frames in ${srcDir}\n`);

const tiers = [];
for (const tier of TIERS) {
  const result = await encodeTier(tier, files, srcDir, outDir);
  tiers.push(result);
  console.log(
    `${result.id.padEnd(8)} ${String(result.frames).padStart(3)} frames  ` +
      `${result.width}x${result.height}  ${String(result.payloadKB).padStart(5)} KB  ` +
      `${String(result.decodedMB).padStart(4)} MB decoded`
  );
}

await writeFile(
  path.join(outDir, 'manifest.json'),
  JSON.stringify({ sourceFrames: files.length, generated: new Date().toISOString(), tiers }, null, 2)
);

console.log(`\nmanifest -> ${path.join(outDir, 'manifest.json')}`);
