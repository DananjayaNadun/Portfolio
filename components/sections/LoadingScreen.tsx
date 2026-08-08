'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import {
  getLoadServerSnapshot,
  getLoadSnapshot,
  subscribeToLoad,
} from '@/lib/hero/load-progress';
import { cn } from '@/lib/utils/cn';

/** Below this, a warm cache resolves so fast the overlay reads as a flash. */
const MIN_VISIBLE_MS = 600;
/** Matches the CSS transition, after which the overlay leaves the DOM. */
const RESOLVE_MS = 700;
/**
 * Hard ceiling. If nothing ever reports — the sequence never mounts, a chunk
 * fails, JS partially errors — the overlay must still leave. A loading screen
 * that can hang forever is worse than a crash: it is indistinguishable from a
 * slow connection, so nobody reports it as a bug. This shipped once already.
 */
const TIMEOUT_MS = 8000;

export function LoadingScreen() {
  const snapshot = useSyncExternalStore(subscribeToLoad, getLoadSnapshot, getLoadServerSnapshot);

  const [resolving, setResolving] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [mountedAt] = useState(() => Date.now());

  const settled = snapshot.status === 'ready' || snapshot.status === 'failed';

  useEffect(() => {
    if (!settled) return;

    // Failures hold slightly longer so the message is readable before the
    // static hero takes over.
    const hold = snapshot.status === 'failed' ? 2600 : MIN_VISIBLE_MS;
    const elapsed = Date.now() - mountedAt;
    const wait = Math.max(0, hold - elapsed);

    const toResolve = window.setTimeout(() => setResolving(true), wait);
    return () => window.clearTimeout(toResolve);
  }, [settled, snapshot.status, mountedAt]);

  useEffect(() => {
    const toTimeout = window.setTimeout(() => setResolving(true), TIMEOUT_MS);
    return () => window.clearTimeout(toTimeout);
  }, []);

  /**
   * Nothing to wait for. If no loader has claimed the overlay shortly after
   * mount — reduced motion, the mobile poster tier, or simply no sequence on
   * this page — resolve straight away rather than holding a screen over a page
   * that is already finished.
   */
  useEffect(() => {
    if (snapshot.status !== 'idle') return;
    const toIdle = window.setTimeout(() => setResolving(true), 400);
    return () => window.clearTimeout(toIdle);
  }, [snapshot.status]);

  useEffect(() => {
    if (!resolving) return;
    const toDismiss = window.setTimeout(() => setDismissed(true), RESOLVE_MS);
    return () => window.clearTimeout(toDismiss);
  }, [resolving]);

  // Fully unmounted once resolved — no lingering fixed layer for the
  // compositor to carry for the rest of the session.
  if (dismissed) return null;

  const percent = Math.round(snapshot.progress * 100);
  const failed = snapshot.status === 'failed';

  return (
    <div
      id="loading"
      role="status"
      aria-live="polite"
      aria-label={failed ? 'Sequence unavailable' : 'Loading'}
      className={cn(
        'fixed inset-0 z-[100] grid place-content-center justify-items-center gap-6',
        'bg-(--surface-void) transition-opacity duration-(--dur-slower) ease-(--ease-standard)',
        resolving ? 'pointer-events-none opacity-0' : 'opacity-100'
      )}
    >
      <p className="t-label text-(--text-tertiary)">
        {failed ? 'Sequence unavailable' : 'Decoding sequence'}
      </p>

      {failed ? (
        <p className="t-caption max-w-[36ch] text-center text-(--accent-text)">
          {snapshot.error ?? 'The introduction could not load. Showing a still instead.'}
        </p>
      ) : (
        <>
          <div
            className="h-px w-[min(260px,54vw)] overflow-hidden bg-(--border-subtle)"
            data-decorative
          >
            <div
              className="h-full origin-left bg-(--accent) transition-transform duration-200 ease-linear"
              style={{ transform: `scaleX(${snapshot.progress})` }}
            />
          </div>
          <p className="t-label text-(--text-secondary)" data-numeric>
            {percent}%
          </p>
        </>
      )}
    </div>
  );
}
