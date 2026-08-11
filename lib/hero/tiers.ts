import manifest from '@/public/hero/manifest.json';

export type HeroTier = {
  readonly id: string;
  readonly width: number;
  readonly height: number;
  readonly frames: number;
  readonly pattern: string;
  readonly decodedMB: number;
};

const TIERS = manifest.tiers as readonly HeroTier[];

function tierById(id: string): HeroTier {
  const tier = TIERS.find((candidate) => candidate.id === id);
  if (!tier) throw new Error(`hero tier "${id}" missing from manifest`);
  return tier;
}

export const DESKTOP_TIER = tierById('desktop');
export const TABLET_TIER = tierById('tablet');
export const MOBILE_TIER = tierById('mobile');

/** Below this the hero is a composed still rather than a scrub. */
export const SCRUB_MIN_WIDTH = 768;
/**
 * Above this the full frame count is worth the memory. Deliberately equal to
 * Tailwind's `lg` breakpoint, where the hero switches from a full-bleed
 * portrait to the composed split layout — so the tier and the composition
 * always change together.
 */
export const FULL_SCRUB_MIN_WIDTH = 1024;

export type Capabilities = {
  viewportWidth: number;
  reducedMotion: boolean;
  deviceMemory: number | undefined;
  saveData: boolean;
};

export function readCapabilities(): Capabilities {
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };

  return {
    viewportWidth: window.innerWidth,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    deviceMemory: nav.deviceMemory,
    saveData: nav.connection?.saveData === true,
  };
}

/**
 * Chooses a tier, or `null` for the poster-only path.
 *
 * Frame count is a memory budget: an ImageBitmap pins width x height x 4 bytes,
 * so the desktop tier holds 236 MB and the tablet tier 119 MB. A low-memory or
 * data-saving desktop therefore drops to the tablet tier rather than to a still
 * — it still gets the gesture, just with fewer samples of it.
 *
 * The two conditions that fall through to poster-only — reduced motion and a
 * narrow viewport — are exactly the two expressible in CSS, which is why the
 * scroll track's height can be set in the stylesheet and never needs to change
 * after hydration.
 */
export function selectTier(capabilities: Capabilities): HeroTier | null {
  if (capabilities.reducedMotion) return null;
  if (capabilities.viewportWidth < SCRUB_MIN_WIDTH) return null;
  if (capabilities.saveData) return TABLET_TIER;
  if (capabilities.viewportWidth < FULL_SCRUB_MIN_WIDTH) return TABLET_TIER;
  if (capabilities.deviceMemory !== undefined && capabilities.deviceMemory < 6) return TABLET_TIER;
  return DESKTOP_TIER;
}

/** The first frame — a three-quarter profile. What the scrub starts on. */
export const POSTER_START = `/hero/desktop/000.webp`;
/** The final frame — eye contact. The strongest single still. */
export const POSTER_END = `/hero/mobile/000.webp`;
export const POSTER_WIDTH = MOBILE_TIER.width;
export const POSTER_HEIGHT = MOBILE_TIER.height;
