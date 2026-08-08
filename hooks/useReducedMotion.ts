'use client';

import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Tracks the user's motion preference, including changes made mid-session.
 *
 * A one-shot read on mount is the common implementation and it is wrong —
 * people toggle this setting precisely because a page is making them unwell,
 * and it should take effect without a reload.
 *
 * Starts `false` so server and first client render agree; the effect corrects
 * it before paint. Components must therefore treat `true` as "remove motion"
 * rather than gating whether they render at all.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(QUERY);
    setReduced(media.matches);

    const handleChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  return reduced;
}
