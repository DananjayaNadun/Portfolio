/**
 * The single application-wide animation loop.
 *
 * Deliberately a module singleton outside React. Scroll and pointer state never
 * enter React state — writing 60 fps updates into a render path is the largest
 * available performance mistake on a site like this.
 *
 * Strict two-phase discipline:
 *   1. READ  — scroll, viewport and pointer sampled exactly once per frame.
 *   2. WRITE — every subscriber receives that snapshot and writes styles.
 *
 * Subscribers MUST NOT call getBoundingClientRect() during write. Cache rects
 * and refresh them from a ResizeObserver. This is what holds the "0 forced
 * synchronous layouts per frame" budget.
 *
 * The loop idle-stops: with no subscribers, no frame is scheduled.
 */

export type FrameState = {
  /** Milliseconds since the previous frame, clamped to survive tab restores. */
  readonly dt: number;
  readonly scrollY: number;
  readonly viewportWidth: number;
  readonly viewportHeight: number;
  readonly pointerX: number;
  readonly pointerY: number;
  /** False until the pointer has moved at least once — lets effects stay dormant. */
  readonly hasPointer: boolean;
};

type Subscriber = (state: FrameState) => void;

const subscribers = new Set<Subscriber>();

let rafId: number | null = null;
let lastTime = 0;
let listening = false;

/** Viewport dimensions are cached; reading them per frame forces layout. */
let viewportWidth = 0;
let viewportHeight = 0;
let pointerX = 0;
let pointerY = 0;
let hasPointer = false;

function readViewport(): void {
  viewportWidth = window.innerWidth;
  viewportHeight = window.innerHeight;
}

function handlePointerMove(event: PointerEvent): void {
  pointerX = event.clientX;
  pointerY = event.clientY;
  hasPointer = true;
}

function attach(): void {
  if (listening) return;
  listening = true;
  readViewport();
  window.addEventListener('resize', readViewport, { passive: true });
  window.addEventListener('pointermove', handlePointerMove, { passive: true });
}

function detach(): void {
  if (!listening) return;
  listening = false;
  window.removeEventListener('resize', readViewport);
  window.removeEventListener('pointermove', handlePointerMove);
}

function frame(time: number): void {
  // A tab restored from the background reports an enormous delta. Clamping to
  // ~4 frames keeps damped values from teleporting on return.
  const dt = lastTime === 0 ? 16.667 : Math.min(time - lastTime, 64);
  lastTime = time;

  const state: FrameState = {
    dt,
    scrollY: window.scrollY,
    viewportWidth,
    viewportHeight,
    pointerX,
    pointerY,
    hasPointer,
  };

  for (const subscriber of subscribers) subscriber(state);

  rafId = subscribers.size > 0 ? requestAnimationFrame(frame) : null;
}

function start(): void {
  if (rafId !== null) return;
  attach();
  lastTime = 0;
  rafId = requestAnimationFrame(frame);
}

function stop(): void {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  detach();
}

/**
 * Registers a per-frame callback. Returns an unsubscribe function; the loop
 * stops automatically once the last subscriber leaves.
 */
export function subscribe(subscriber: Subscriber): () => void {
  subscribers.add(subscriber);
  start();

  return () => {
    subscribers.delete(subscriber);
    if (subscribers.size === 0) stop();
  };
}

/** Current viewport, for callers that need it outside a frame callback. */
export function getViewport(): { width: number; height: number } {
  if (viewportWidth === 0) readViewport();
  return { width: viewportWidth, height: viewportHeight };
}
