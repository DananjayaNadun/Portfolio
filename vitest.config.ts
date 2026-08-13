import { defineConfig } from 'vitest/config';
import path from 'node:path';

/**
 * Unit tests only — logic with no DOM rendering.
 *
 * Component rendering is deliberately not covered here: it would need jsdom,
 * which cannot lay anything out, so a passing test would prove nothing about
 * the layout, contrast, or motion that this site's correctness actually depends
 * on. Those live in the Playwright gates instead, where a real engine measures
 * real pixels.
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
  },
  resolve: {
    alias: { '@': path.resolve(process.cwd()) },
  },
});
