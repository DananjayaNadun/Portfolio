'use client';

import { useEffect, useRef } from 'react';

/**
 * Runs `callback` once on mount and whenever the document's size changes.
 *
 * Exists so components can cache layout measurements instead of reading them
 * per frame. A window `resize` listener is not sufficient: it misses reflows
 * that change document height without changing the window — font swap, image
 * load, a section expanding, orientation-independent content shifts.
 */
export function useIsomorphicResizeObserver(callback: () => void): void {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const run = () => callbackRef.current();
    run();

    const observer = new ResizeObserver(run);
    observer.observe(document.documentElement);
    observer.observe(document.body);

    window.addEventListener('load', run);
    return () => {
      observer.disconnect();
      window.removeEventListener('load', run);
    };
  }, []);
}
