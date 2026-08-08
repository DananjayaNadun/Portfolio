import { DAMP_SEQUENCE, damp, dampSettled } from '@/lib/motion/damp';
import { clamp } from '@/lib/utils/clamp';
import type { HeroTier } from './tiers';

/** Simultaneous decodes. Enough to saturate the pipe, few enough to leave the
 *  main thread responsive while the loading screen is still animating. */
const DECODE_CONCURRENCY = 6;

/** Cover-fit overshoot at progress 0, resolving to 1.0 as the gesture completes. */
const PUSH_IN = 0.07;

/** Vertical anchor of the cover crop. The face sits above centre. */
const FOCAL_Y = 0.42;

export type SequenceState = {
  readonly progress: number;
  readonly frameSlot: number;
  readonly decoded: number;
  readonly tierId: string;
};

/**
 * Drives a scroll-bound image sequence onto a canvas.
 *
 * Deliberately free of React and of any DOM framework: it takes a canvas and a
 * tier, and exposes an imperative surface. That is what makes it unit-testable
 * and what lets the reduced-motion and deep-link paths render a frame with no
 * scroll gesture to read.
 */
export class HeroSequenceController {
  private readonly canvas: HTMLCanvasElement;
  private readonly context: CanvasRenderingContext2D;
  private readonly tier: HeroTier;

  private frames: Array<ImageBitmap | HTMLImageElement | undefined>;
  private decoded = 0;

  private bufferWidth = 0;
  private bufferHeight = 0;

  private current = 0;
  private lastDrawn = -1;
  private lastProgress = 0;

  private destroyed = false;
  private readonly abort = new AbortController();

  constructor(canvas: HTMLCanvasElement, tier: HeroTier) {
    const context = canvas.getContext('2d', { alpha: true });
    if (!context) throw new Error('2d canvas context unavailable');

    this.canvas = canvas;
    this.context = context;
    this.tier = tier;
    this.frames = new Array<ImageBitmap | undefined>(tier.frames);
  }

  get state(): SequenceState {
    return {
      progress: this.lastProgress,
      frameSlot: this.lastDrawn,
      decoded: this.decoded,
      tierId: this.tier.id,
    };
  }

  private frameUrl(index: number): string {
    return this.tier.pattern.replace('{i}', String(index).padStart(3, '0'));
  }

  /**
   * Frames are same-origin files, so `fetch` is safe here. Base64 payloads are
   * not: data: URIs fall under CSP `connect-src` and a policy blocks them
   * silently, which strands the loader forever.
   */
  private async decodeFrame(index: number): Promise<void> {
    const response = await fetch(this.frameUrl(index), { signal: this.abort.signal });
    if (!response.ok) throw new Error(`frame ${index} failed: ${response.status}`);

    const blob = await response.blob();
    this.frames[index] =
      typeof createImageBitmap === 'function'
        ? await createImageBitmap(blob)
        : await loadViaImageElement(blob);

    this.decoded += 1;
  }

  async load(onProgress?: (fraction: number) => void): Promise<void> {
    let next = 0;

    const worker = async (): Promise<void> => {
      while (next < this.tier.frames && !this.destroyed) {
        const index = next;
        next += 1;
        await this.decodeFrame(index);
        onProgress?.(this.decoded / this.tier.frames);
      }
    };

    await Promise.all(
      Array.from({ length: Math.min(DECODE_CONCURRENCY, this.tier.frames) }, worker)
    );
  }

  /**
   * Matches the drawing buffer to the element's CSS box.
   *
   * Called from a ResizeObserver rather than a window resize listener: the
   * latter misses reflows that don't change the window — font swap, container
   * changes, orientation-independent shifts.
   */
  resize(): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = this.canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width * dpr));
    const height = Math.max(1, Math.round(rect.height * dpr));

    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }

    this.bufferWidth = width;
    this.bufferHeight = height;
    this.lastDrawn = -1;
  }

  private draw(slot: number, progress: number): void {
    const frame = this.frames[slot];
    if (!frame || this.bufferWidth === 0) return;

    const { width: fw, height: fh } = frameSize(frame);
    const cover = Math.max(this.bufferWidth / fw, this.bufferHeight / fh);

    // The push-in is applied to the cover factor, not as a CSS transform on the
    // canvas — transforming the element would resample and visibly soften it.
    const scale = cover * (1 + PUSH_IN * (1 - progress));
    const dw = fw * scale;
    const dh = fh * scale;

    this.context.clearRect(0, 0, this.bufferWidth, this.bufferHeight);
    this.context.drawImage(
      frame,
      (this.bufferWidth - dw) / 2,
      (this.bufferHeight - dh) * FOCAL_Y,
      dw,
      dh
    );
  }

  /** Deterministic render. No damping — used for first paint and tests. */
  renderAt(progress: number): void {
    const p = clamp(progress, 0, 1);
    this.lastProgress = p;
    this.current = p * (this.tier.frames - 1);

    const slot = Math.round(this.current);
    this.draw(slot, p);
    this.lastDrawn = slot;
  }

  /** Damped render, driven from the shared ticker. */
  update(progress: number, dt: number): void {
    const p = clamp(progress, 0, 1);
    this.lastProgress = p;

    const target = p * (this.tier.frames - 1);
    this.current = dampSettled(damp(this.current, target, DAMP_SEQUENCE, dt), target);

    const slot = Math.round(this.current);
    if (slot !== this.lastDrawn) {
      this.draw(slot, p);
      this.lastDrawn = slot;
    }
  }

  destroy(): void {
    this.destroyed = true;
    this.abort.abort();

    for (const frame of this.frames) {
      if (frame && 'close' in frame) frame.close();
    }
    this.frames = [];
  }
}

function frameSize(frame: ImageBitmap | HTMLImageElement): { width: number; height: number } {
  return 'naturalWidth' in frame
    ? { width: frame.naturalWidth, height: frame.naturalHeight }
    : { width: frame.width, height: frame.height };
}

/** Fallback for engines without createImageBitmap. Costs a main-thread decode. */
function loadViaImageElement(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('image decode failed'));
    };
    image.src = url;
  });
}
