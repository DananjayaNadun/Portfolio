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
 * Tiers trade frame count against resolution at a fixed memory ceiling.
 *
 * Width is now the SOURCE width, 720. The earlier 480 encode was a mistake for
 * a hero used as a background: it discarded a third of the detail the footage
 * actually has, and no layout can recover pixels that were never encoded.
 * Resampling above 1.0 is what reads as blur, so the encode must at least match
 * what the screen will ask for.
 *
 * 720x1280 pins 3.69 MB per decoded frame, so the 250 MB ceiling in CLAUDE.md
 * allows 67 frames. Smoothness is what gets spent:
 *   desktop   61 frames -> 225 MB   (stride 5)
 *   tablet    38 frames ->  85 MB   (stride 8, narrower)
 *   mobile     1 frame  ->   4 MB
 *
 * 61 frames over a 600vh track is ~78px of scroll per frame against 28px for
 * the old 151-frame encode. That is the real cost of this change, and it is
 * paid deliberately: at background scale, softness is visible everywhere at
 * once, while frame stepping is only visible while actively scrolling.
 *
 * @type {Tier[]}
 */
const TIERS = [
  { id: 'desktop', width: 720, quality: 72, stride: 4, note: 'full scrub, >=1024px viewports' },
  { id: 'tablet', width: 560, quality: 68, stride: 7, note: 'reduced scrub, 768-1023px' },
  { id: 'mobile', width: 720, quality: 80, stride: 0, note: 'poster only — final frame' },
];

const BYTES_PER_PIXEL = 4;

const { values } = parseArgs({
  options: {
    src: { type: 'string' },
    out: { type: 'string', default: 'public/hero' },
    /**
     * Inclusive 1-based source range. The captured sequence runs to frame 300,
     * but the turn completes at 266 — the frames after it drift past eye
     * contact and undo the gesture the whole hero exists to deliver. Trimming
     * here rather than in the component means those frames are never encoded,
     * never shipped, and never decoded into memory.
     */
    first: { type: 'string', default: '1' },
    last: { type: 'string' },
  },
});

if (!values.src) {
  console.error(
    'usage: node scripts/encode-hero.mjs --src <dir-of-pngs> [--out public/hero] [--first 1] [--last 266]'
  );
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

const allFiles = (await readdir(srcDir)).filter((f) => /\.png$/i.test(f)).sort();
if (allFiles.length === 0) {
  console.error(`no PNGs found in ${srcDir}`);
  process.exit(1);
}

const firstIndex = Math.max(1, Number(values.first)) - 1;
const lastIndex = values.last ? Math.min(allFiles.length, Number(values.last)) : allFiles.length;
const files = allFiles.slice(firstIndex, lastIndex);

if (files.length === 0) {
  console.error(`range --first ${values.first} --last ${values.last} selected no frames`);
  process.exit(1);
}

console.log(
  `source: ${allFiles.length} frames in ${srcDir}\n` +
    `using:  ${files.length} (${files[0]} .. ${files[files.length - 1]})\n`
);

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
  JSON.stringify(
    {
      sourceFrames: allFiles.length,
      usedFrames: files.length,
      range: { first: files[0], last: files[files.length - 1] },
      generated: new Date().toISOString(),
      tiers,
    },
    null,
    2
  )
);

console.log(`\nmanifest -> ${path.join(outDir, 'manifest.json')}`);
