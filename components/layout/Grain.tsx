/**
 * Film grain over the whole document.
 *
 * This is a technical fix, not a texture choice. The page operates almost
 * entirely between luma 5 and 30, where 8-bit sRGB has roughly 25
 * distinguishable steps — so every large gradient in the system (the crimson
 * key bed, the vignette, the hero's own falloff) would band visibly. Noise
 * dithers those bands below the perceptual threshold.
 *
 * Exactly one instance for the entire document. Per-section grain would
 * multiply the compositing cost for no visual gain.
 */
export function Grain() {
  return (
    <svg
      className="grain pointer-events-none fixed inset-0 z-[60] h-full w-full opacity-[0.028] mix-blend-soft-light"
      aria-hidden="true"
      data-decorative
    >
      <filter id="grain-noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain-noise)" />
    </svg>
  );
}
