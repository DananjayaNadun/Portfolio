/**
 * Frame-rate-independent exponential damping.
 *
 * The naive form — `current += (target - current) * lambda` — runs once per
 * animation frame, so it settles twice as fast on a 120 Hz display as on a
 * 60 Hz one. The site then literally feels different depending on the monitor.
 * Normalising against elapsed time removes that.
 *
 * @param lambda Fraction of the remaining gap closed per 60 Hz frame (0–1).
 *               0.16 is the tuned value for the hero sequence: it closes 90%
 *               of the distance in ~220 ms, which is where `--dur-base` came from.
 * @param dt     Milliseconds since the previous frame.
 */
export function damp(current: number, target: number, lambda: number, dt: number): number {
  const k = 1 - Math.pow(1 - lambda, dt / 16.667);
  return current + (target - current) * k;
}

/** Snaps to the target once the remaining gap is below the perceptual floor. */
export function dampSettled(current: number, target: number, epsilon = 0.008): number {
  return Math.abs(target - current) < epsilon ? target : current;
}

export const DAMP_SEQUENCE = 0.16;
export const DAMP_POINTER = 0.22;
export const DAMP_PARALLAX = 0.1;
