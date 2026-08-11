'use client';

import { useEffect, useRef } from 'react';
import { subscribe, type FrameState } from '@/lib/motion/ticker';

/**
 * Subscribes a callback to the shared animation loop.
 *
 * The callback is held in a ref so a component can close over fresh props
 * without resubscribing every render — resubscribing would tear the loop down
 * and rebuild it on each commit.
 *
 * @param enabled Pass false to stay unsubscribed (reduced motion, coarse
 *                pointer, off-screen). The loop stops entirely when the last
 *                subscriber leaves, so this genuinely costs nothing.
 */
export function useFrame(callback: (state: FrameState) => void, enabled = true): void {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!enabled) return;
    return subscribe((state) => callbackRef.current(state));
  }, [enabled]);
}
