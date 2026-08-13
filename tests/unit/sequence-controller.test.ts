import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HeroSequenceController } from '@/lib/hero/sequence-controller';
import type { HeroTier } from '@/lib/hero/tiers';

const TIER: HeroTier = {
  id: 'test',
  width: 720,
  height: 1280,
  frames: 68,
  pattern: '/hero/test/{i}.webp',
  decodedMB: 239,
};

/**
 * A canvas stub rather than jsdom: the controller only needs a 2D context that
 * records `drawImage`, and a box to measure. jsdom would supply neither a real
 * context nor a real layout, so it would add a dependency and prove less.
 */
function makeCanvas(width = 720, height = 720) {
  const drawn: { slot: unknown; dx: number; dy: number; dw: number; dh: number }[] = [];

  const context = {
    clearRect: vi.fn(),
    drawImage: vi.fn((frame: unknown, dx: number, dy: number, dw: number, dh: number) => {
      drawn.push({ slot: frame, dx, dy, dw, dh });
    }),
  };

  const canvas = {
    width: 300,
    height: 150,
    getContext: () => context,
    getBoundingClientRect: () => ({ width, height }),
  };

  return { canvas: canvas as unknown as HTMLCanvasElement, context, drawn };
}

/** Stands in for a decoded ImageBitmap. */
const frame = (index: number) => ({ width: TIER.width, height: TIER.height, index });

function primed(width = 720, height = 720) {
  const { canvas, drawn } = makeCanvas(width, height);
  const controller = new HeroSequenceController(canvas, TIER);

  // Bypass the network: fill the private frame store with stand-ins.
  const store = (controller as unknown as { frames: unknown[] }).frames;
  for (let i = 0; i < TIER.frames; i += 1) store[i] = frame(i);

  controller.resize();
  return { controller, drawn };
}

beforeEach(() => {
  vi.stubGlobal('window', { devicePixelRatio: 1 });
});

describe('resize', () => {
  it('matches the backing store to the CSS box at DPR 1', () => {
    const { canvas } = makeCanvas(720, 900);
    const controller = new HeroSequenceController(canvas, TIER);
    controller.resize();
    expect([canvas.width, canvas.height]).toEqual([720, 900]);
  });

  it('caps device pixel ratio at 2', () => {
    vi.stubGlobal('window', { devicePixelRatio: 4 });
    const { canvas } = makeCanvas(720, 720);
    const controller = new HeroSequenceController(canvas, TIER);
    controller.resize();
    expect(canvas.width).toBe(1440);
  });
});

describe('renderAt frame mapping', () => {
  it('maps progress 0 to the first frame and 1 to the last', () => {
    const { controller } = primed();
    expect(controller.renderAt(0) ?? controller.state.frameSlot).toBe(0);
    controller.renderAt(1);
    expect(controller.state.frameSlot).toBe(TIER.frames - 1);
  });

  it('maps the midpoint to the middle frame', () => {
    const { controller } = primed();
    controller.renderAt(0.5);
    expect(controller.state.frameSlot).toBe(Math.round(0.5 * (TIER.frames - 1)));
  });

  it('advances monotonically across the track', () => {
    const { controller } = primed();
    let previous = -1;
    for (let p = 0; p <= 1.0001; p += 0.02) {
      controller.renderAt(p);
      expect(controller.state.frameSlot).toBeGreaterThanOrEqual(previous);
      previous = controller.state.frameSlot;
    }
    expect(previous).toBe(TIER.frames - 1);
  });

  it('clamps out-of-range progress instead of indexing past the sequence', () => {
    const { controller } = primed();
    controller.renderAt(-5);
    expect(controller.state.frameSlot).toBe(0);
    controller.renderAt(99);
    expect(controller.state.frameSlot).toBe(TIER.frames - 1);
  });
});

describe('draw geometry', () => {
  it('never scales above 1.0 when the box is no larger than the source', () => {
    // The push-in was removed precisely because any upscale resamples an
    // already-small source. This is that guarantee, expressed as a test.
    const { controller, drawn } = primed(720, 720);
    controller.renderAt(0);
    const last = drawn[drawn.length - 1];
    expect(last?.dw).toBe(720);
  });

  it('covers the box rather than letterboxing it', () => {
    const { controller, drawn } = primed(1000, 500);
    controller.renderAt(0);
    const last = drawn[drawn.length - 1];
    expect(last?.dw).toBeGreaterThanOrEqual(1000);
    expect(last?.dh).toBeGreaterThanOrEqual(500);
  });

  it('centres horizontally', () => {
    const { controller, drawn } = primed(1000, 500);
    controller.renderAt(0);
    const last = drawn[drawn.length - 1];
    expect(last!.dx).toBeCloseTo((1000 - last!.dw) / 2, 5);
  });
});

describe('update', () => {
  it('redraws only when the rounded frame changes', () => {
    const { controller, drawn } = primed();
    controller.renderAt(0);
    const before = drawn.length;

    // A tiny progress change that cannot move the rounded index.
    controller.update(0.0001, 16.667);
    expect(drawn.length).toBe(before);
  });

  it('eventually reaches the final frame when held at the end', () => {
    const { controller } = primed();
    for (let i = 0; i < 300; i += 1) controller.update(1, 16.667);
    expect(controller.state.frameSlot).toBe(TIER.frames - 1);
  });
});
