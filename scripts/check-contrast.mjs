/**
 * Token contrast gate.
 *
 * Parses the real custom properties out of styles/globals.css and measures
 * every text/surface pairing the design system actually uses. It exists because
 * docs/02-DESIGN-SYSTEM.md asserts specific ratios, and an assertion nobody
 * re-measures is a comment, not a guarantee — four of those numbers were wrong
 * the first time they were computed by hand.
 *
 *   node scripts/check-contrast.mjs
 *
 * Exits non-zero if any pairing regresses below its required floor.
 */

import { readFileSync } from 'node:fs';
import path from 'node:path';

const CSS = readFileSync(path.join(process.cwd(), 'styles/globals.css'), 'utf8');

/** Pulls `--name: #rrggbb;` declarations. Non-hex values are ignored. */
function readTokens(css) {
  const tokens = new Map();
  const re = /--([a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\s*;/g;
  let match;
  while ((match = re.exec(css)) !== null) tokens.set(match[1], match[2]);
  return tokens;
}

function toRgb(hex) {
  let h = hex.slice(1);
  if (h.length === 3) h = [...h].map((c) => c + c).join('');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}

/** WCAG 2.x relative luminance. */
function luminance(hex) {
  const [r, g, b] = toRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

const tokens = readTokens(CSS);

/**
 * Each row is a real pairing from the built UI, with the floor that applies to
 * it. Body copy targets AAA (7:1) per docs/01-PRD.md; large text and non-text
 * UI carry the lower WCAG minimums.
 */
const PAIRINGS = [
  ['color-ink-primary', 'color-ink-base', 7, 'body text on page'],
  ['color-ink-primary', 'color-ink-raised', 7, 'body text on raised surface'],
  ['color-ink-secondary', 'color-ink-base', 4.5, 'secondary text on page'],
  ['color-ink-muted', 'color-ink-base', 4.5, 'tertiary/label text on page'],
  ['color-crimson-200', 'color-ink-base', 4.5, 'accent text on page'],
  ['color-crimson-300', 'color-ink-base', 4.5, 'accent text, lighter step'],
  ['color-jade-300', 'color-ink-base', 4.5, 'availability text'],
  ['color-ink-void', 'color-ink-primary', 4.5, 'primary button label on fill'],
  ['color-ink-line-strong', 'color-ink-base', 3, 'input border (non-text)'],
];

let failures = 0;
let skipped = 0;
const rows = [];

for (const [fg, bg, floor, label] of PAIRINGS) {
  const fgHex = tokens.get(fg);
  const bgHex = tokens.get(bg);

  if (!fgHex || !bgHex) {
    skipped += 1;
    rows.push({ label, status: 'SKIP', detail: `missing --${!fgHex ? fg : bg}` });
    continue;
  }

  const value = ratio(fgHex, bgHex);
  const pass = value >= floor;
  if (!pass) failures += 1;
  rows.push({
    label,
    status: pass ? 'PASS' : 'FAIL',
    detail: `${value.toFixed(2)}:1 (floor ${floor}:1)  ${fgHex} on ${bgHex}`,
  });
}

for (const row of rows) {
  console.log(`  ${row.status}  ${row.label.padEnd(34)} ${row.detail}`);
}

console.log('');
if (skipped > 0) {
  console.log(`${skipped} pairing(s) skipped — a token was renamed or removed.`);
}
console.log(
  failures === 0
    ? `contrast: ${rows.length - skipped} pairings pass`
    : `contrast: ${failures} pairing(s) BELOW FLOOR`
);

// A skipped pairing is a silent hole in the gate, so it fails too.
process.exit(failures === 0 && skipped === 0 ? 0 : 1);
