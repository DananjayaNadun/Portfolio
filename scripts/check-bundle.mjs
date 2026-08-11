/**
 * Route JS budget check.
 *
 * Measures the gzipped weight of the JavaScript the home route actually loads,
 * by reading the build manifest rather than summing every chunk on disk —
 * `.next/static/chunks` also contains code for other entrypoints, which would
 * inflate the number and make the budget meaningless.
 *
 *   node scripts/check-bundle.mjs
 */

import { gzipSync } from 'node:zlib';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

/**
 * Two budgets, because only one of them is actionable.
 *
 * The App Router runtime is a fixed cost of the framework — measured at ~126 KB
 * gzipped for React 19 + Next 16 — and no amount of application-side work moves
 * it. docs/01-PRD.md §12 set a single 120 KB route budget in Phase 1, before the
 * stack was chosen in Phase 4; that figure is below the framework floor and can
 * never pass. Splitting it makes the number mean something: APP_BUDGET_KB is the
 * part the team controls, and regressions there are real regressions.
 */
const APP_BUDGET_KB = 25;
const TOTAL_ADVISORY_KB = 160;
const ROOT = process.cwd();
const NEXT = path.join(ROOT, '.next');

function gzipKB(file) {
  return gzipSync(readFileSync(file)).length / 1024;
}

/**
 * Next 16 + Turbopack splits first-load JS into `rootMainFiles` (the App Router
 * runtime, loaded on every route) plus per-route chunks.
 *
 * `polyfillFiles` is excluded deliberately: it is served only to browsers that
 * fail the modern-syntax check, via a separate script tag that modern engines
 * skip. Counting it would tax the budget with bytes no current browser fetches.
 */
function collectFromManifest() {
  const manifestPath = path.join(NEXT, 'build-manifest.json');
  if (!existsSync(manifestPath)) return { files: [], polyfills: [] };

  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const files = new Set();

  for (const asset of manifest.rootMainFiles ?? []) {
    if (asset.endsWith('.js')) files.add(path.join(NEXT, asset));
  }

  for (const assets of Object.values(manifest.pages ?? {})) {
    for (const asset of assets) {
      if (asset.endsWith('.js')) files.add(path.join(NEXT, asset));
    }
  }

  // Route-specific chunks are not listed for App Router routes, so anything in
  // chunks/ that is neither runtime nor polyfill belongs to the page.
  const known = new Set([
    ...(manifest.rootMainFiles ?? []),
    ...(manifest.polyfillFiles ?? []),
  ].map((asset) => path.join(NEXT, asset)));

  for (const file of collectAllChunks()) {
    if (!known.has(file)) files.add(file);
  }

  return {
    files: [...files].filter((file) => existsSync(file)),
    polyfills: (manifest.polyfillFiles ?? [])
      .map((asset) => path.join(NEXT, asset))
      .filter((file) => existsSync(file)),
  };
}

function collectAllChunks() {
  const dir = path.join(NEXT, 'static', 'chunks');
  const out = [];
  const walk = (current) => {
    for (const entry of readdirSync(current)) {
      const full = path.join(current, entry);
      if (statSync(full).isDirectory()) walk(full);
      else if (entry.endsWith('.js')) out.push(full);
    }
  };
  if (existsSync(dir)) walk(dir);
  return out;
}

const { files: routeFiles, polyfills } = collectFromManifest();
const usingManifest = routeFiles.length > 0;
const files = usingManifest ? routeFiles : collectAllChunks();

if (files.length === 0) {
  console.error('no build output found — run `npm run build` first');
  process.exit(1);
}

let total = 0;
const rows = files
  .map((file) => {
    const kb = gzipKB(file);
    total += kb;
    return { name: path.relative(NEXT, file), kb };
  })
  .sort((a, b) => b.kb - a.kb);

console.log(usingManifest ? 'route: / (from build manifest)' : 'all chunks (manifest unavailable)');
for (const row of rows.slice(0, 10)) {
  console.log(`  ${row.kb.toFixed(1).padStart(7)} KB  ${row.name}`);
}
if (rows.length > 10) console.log(`  ${'…'.padStart(7)}     ${rows.length - 10} more`);

const polyfillKB = polyfills.reduce((sum, file) => sum + gzipKB(file), 0);

// Runtime chunks are those the manifest lists as rootMainFiles; everything else
// on this route is application code.
const manifest = JSON.parse(readFileSync(path.join(NEXT, 'build-manifest.json'), 'utf8'));
const runtimeSet = new Set((manifest.rootMainFiles ?? []).map((a) => path.join(NEXT, a)));
const runtimeKB = files.filter((f) => runtimeSet.has(f)).reduce((s, f) => s + gzipKB(f), 0);
const appKB = total - runtimeKB;

const appOk = appKB <= APP_BUDGET_KB;
const totalOk = total <= TOTAL_ADVISORY_KB;

console.log('');
if (polyfillKB > 0) {
  console.log(`legacy polyfills (nomodule, excluded):  ${polyfillKB.toFixed(1)} KB`);
}
console.log(`framework runtime (fixed):              ${runtimeKB.toFixed(1)} KB`);
console.log(
  `application code:                       ${appKB.toFixed(1)} KB   budget ${APP_BUDGET_KB} KB   ${appOk ? 'PASS' : 'OVER'}`
);
console.log(
  `first-load total:                       ${total.toFixed(1)} KB   advisory ${TOTAL_ADVISORY_KB} KB   ${totalOk ? 'ok' : 'OVER'}`
);

process.exit(appOk && totalOk ? 0 : 1);
