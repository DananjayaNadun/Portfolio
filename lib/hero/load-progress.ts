/**
 * Decode progress channel between the hero sequence and the loading screen.
 *
 * An external store rather than context: the decoder runs outside React (it is
 * driven by the sequence controller), and routing ~150 progress events through
 * a provider would re-render the tree for each one. `useSyncExternalStore`
 * subscribes only the component that actually displays the number.
 *
 * Progress is quantised to whole percent before notifying, so 151 decode
 * callbacks produce at most 101 renders of a single small component.
 */

export type LoadStatus = 'idle' | 'loading' | 'ready' | 'failed';

export type LoadSnapshot = {
  readonly status: LoadStatus;
  /** 0–1. */
  readonly progress: number;
  readonly error: string | null;
};

/**
 * The initial snapshot is a shared frozen constant, not a fresh object.
 *
 * `useSyncExternalStore` compares snapshots by reference; returning a new
 * object from `getServerSnapshot` (or from `getSnapshot` before any change)
 * makes React believe the store mutates on every read, which it reports as a
 * potential infinite render loop.
 */
const INITIAL_SNAPSHOT: LoadSnapshot = Object.freeze({
  status: 'idle' as const,
  progress: 0,
  error: null,
});

let snapshot: LoadSnapshot = INITIAL_SNAPSHOT;

const listeners = new Set<() => void>();

function emit(next: LoadSnapshot): void {
  snapshot = next;
  for (const listener of listeners) listener();
}

export function subscribeToLoad(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getLoadSnapshot(): LoadSnapshot {
  return snapshot;
}

/** Server snapshot. The overlay renders in its initial state during SSR. */
export function getLoadServerSnapshot(): LoadSnapshot {
  return INITIAL_SNAPSHOT;
}

export function startLoading(): void {
  if (snapshot.status === 'loading') return;
  emit({ status: 'loading', progress: 0, error: null });
}

export function setLoadProgress(value: number): void {
  const clamped = value < 0 ? 0 : value > 1 ? 1 : value;
  // Quantise: sub-percent changes are invisible and not worth a render.
  if (Math.round(clamped * 100) === Math.round(snapshot.progress * 100)) return;
  emit({ status: 'loading', progress: clamped, error: null });
}

export function finishLoading(): void {
  emit({ status: 'ready', progress: 1, error: null });
}

export function failLoading(error: string): void {
  emit({ status: 'failed', progress: snapshot.progress, error });
}
