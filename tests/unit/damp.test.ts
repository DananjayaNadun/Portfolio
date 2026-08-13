import { describe, expect, it } from 'vitest';
import { DAMP_SEQUENCE, damp, dampSettled } from '@/lib/motion/damp';

/**
 * The whole reason `damp` exists is that the naive form is frame-rate dependent
 * and behaves differently on a 120 Hz display. That is the property worth
 * testing, and it is invisible in any single-frame assertion.
 */
describe('damp', () => {
  it('converges toward the target', () => {
    const next = damp(0, 100, DAMP_SEQUENCE, 16.667);
    expect(next).toBeGreaterThan(0);
    expect(next).toBeLessThan(100);
  });

  it('closes ~16% of the gap in one 60Hz frame', () => {
    expect(damp(0, 100, DAMP_SEQUENCE, 16.667)).toBeCloseTo(16, 0);
  });

  it('reaches the same position after equal elapsed time at 60Hz and 120Hz', () => {
    // Exact halves. Using 8.333 as "half of 16.667" is off by 0.0005 per frame
    // and accumulates into a visible discrepancy over 40 frames — which is a
    // flaw in the arithmetic of the test, not in the function.
    const dt = 16.667;

    let at60 = 0;
    for (let i = 0; i < 20; i += 1) at60 = damp(at60, 100, DAMP_SEQUENCE, dt);

    let at120 = 0;
    for (let i = 0; i < 40; i += 1) at120 = damp(at120, 100, DAMP_SEQUENCE, dt / 2);

    expect(at120).toBeCloseTo(at60, 10);
  });

  it('takes the same TIME to settle regardless of refresh rate', () => {
    // Guards the regression this function exists to prevent. Measured as time,
    // not position: by frame 40 both curves are near-saturated, so their
    // positions differ by only ~3 units and an absolute-gap assertion would be
    // measuring saturation rather than the bug.
    const msTo90 = (step: (value: number, dt: number) => number, dt: number) => {
      let value = 0;
      let elapsed = 0;
      while (value < 90 && elapsed < 10_000) {
        value = step(value, dt);
        elapsed += dt;
      }
      return elapsed;
    };

    const damped = (value: number, dt: number) => damp(value, 100, DAMP_SEQUENCE, dt);
    const naive = (value: number) => value + (100 - value) * DAMP_SEQUENCE;

    // Correct: same wall-clock time on both displays, within the resolution of
    // the measurement itself. The loop can only observe the crossing at frame
    // boundaries, so each rate quantises it to its own step — one 60Hz frame is
    // the tightest tolerance this method can honestly claim.
    expect(Math.abs(msTo90(damped, 8.3335) - msTo90(damped, 16.667))).toBeLessThanOrEqual(16.667);

    // Naive: counts frames, so a 120Hz display settles in half the time.
    const naive60 = msTo90(naive, 16.667);
    const naive120 = msTo90(naive, 8.3335);
    expect(naive120).toBeLessThan(naive60 * 0.6);
  });

  it('settles ~90% within 220ms, which is where --dur-base came from', () => {
    let value = 0;
    let elapsed = 0;
    while (elapsed < 220) {
      value = damp(value, 100, DAMP_SEQUENCE, 16.667);
      elapsed += 16.667;
    }
    expect(value).toBeGreaterThan(88);
    expect(value).toBeLessThan(95);
  });

  it('never overshoots the target', () => {
    let value = 0;
    for (let i = 0; i < 500; i += 1) value = damp(value, 100, DAMP_SEQUENCE, 16.667);
    expect(value).toBeLessThanOrEqual(100);
  });

  it('survives a long frame without exploding', () => {
    // A restored tab can produce a huge dt. The ticker clamps it, but the maths
    // must stay bounded on its own.
    expect(damp(0, 100, DAMP_SEQUENCE, 5000)).toBeLessThanOrEqual(100);
  });
});

describe('dampSettled', () => {
  it('snaps once inside the perceptual floor', () => {
    expect(dampSettled(99.999, 100)).toBe(100);
  });

  it('leaves a visible gap alone', () => {
    expect(dampSettled(95, 100)).toBe(95);
  });
});
