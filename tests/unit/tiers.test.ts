import { describe, expect, it } from 'vitest';
import {
  DESKTOP_TIER,
  FULL_SCRUB_MIN_WIDTH,
  SCRUB_MIN_WIDTH,
  TABLET_TIER,
  selectTier,
  type Capabilities,
} from '@/lib/hero/tiers';

const base: Capabilities = {
  viewportWidth: 1920,
  reducedMotion: false,
  deviceMemory: 16,
  saveData: false,
};

describe('selectTier', () => {
  it('gives a wide, healthy machine the full sequence', () => {
    expect(selectTier(base)?.id).toBe('desktop');
  });

  it('returns null for reduced motion, at any width', () => {
    expect(selectTier({ ...base, reducedMotion: true })).toBeNull();
  });

  it('returns null below the scrub width', () => {
    expect(selectTier({ ...base, viewportWidth: SCRUB_MIN_WIDTH - 1 })).toBeNull();
  });

  it('scrubs exactly at the threshold, not one pixel above it', () => {
    expect(selectTier({ ...base, viewportWidth: SCRUB_MIN_WIDTH })).not.toBeNull();
  });

  it('drops to tablet between the two width thresholds', () => {
    expect(selectTier({ ...base, viewportWidth: FULL_SCRUB_MIN_WIDTH - 1 })?.id).toBe('tablet');
  });

  it('drops to tablet on a low-memory machine rather than to a still', () => {
    // The gesture is the point; a constrained device should get fewer samples
    // of it, not none of it.
    expect(selectTier({ ...base, deviceMemory: 4 })?.id).toBe('tablet');
  });

  it('honours save-data', () => {
    expect(selectTier({ ...base, saveData: true })?.id).toBe('tablet');
  });

  it('assumes capable when deviceMemory is unreported', () => {
    // Safari does not expose it, and treating "unknown" as "weak" would
    // downgrade every Mac.
    expect(selectTier({ ...base, deviceMemory: undefined })?.id).toBe('desktop');
  });

  it('prefers reduced motion over every other signal', () => {
    expect(selectTier({ ...base, reducedMotion: true, deviceMemory: 64 })).toBeNull();
  });
});

describe('tier memory budgets', () => {
  // CLAUDE.md: hero decode memory <= 250 MB desktop. An ImageBitmap pins
  // width * height * 4 bytes, so this is arithmetic, not a guess — and it is
  // the constraint that has been violated twice already.
  const megabytes = (t: { width: number; height: number; frames: number }) =>
    (t.width * t.height * 4 * t.frames) / 1048576;

  it('keeps the desktop tier inside the 250 MB ceiling', () => {
    expect(megabytes(DESKTOP_TIER)).toBeLessThanOrEqual(250);
  });

  it('keeps the tablet tier well under the desktop tier', () => {
    expect(megabytes(TABLET_TIER)).toBeLessThan(megabytes(DESKTOP_TIER));
  });

  it('reports the resolution the encoder actually produced', () => {
    expect(DESKTOP_TIER.width).toBe(720);
    expect(DESKTOP_TIER.frames).toBeGreaterThan(1);
  });
});
