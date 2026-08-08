/** Constrains `value` to the inclusive range [min, max]. */
export function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

/**
 * Normalises `value` to 0–1 across the segment [from, to].
 *
 * Used to drive staged reveals from a single scroll progress value: a element
 * that should appear between 30% and 44% of the hero uses `segment(p, 0.3, 0.44)`.
 */
export function segment(value: number, from: number, to: number): number {
  if (to === from) return value >= to ? 1 : 0;
  return clamp((value - from) / (to - from), 0, 1);
}
