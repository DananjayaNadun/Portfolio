'use client';

import { useEffect, useState } from 'react';

/**
 * Subscribes to a media query.
 *
 * Returns `defaultValue` during SSR and the first client render so markup
 * matches, then corrects in an effect. Callers must render something valid for
 * the default rather than branching on it structurally.
 */
export function useMediaQuery(query: string, defaultValue = false): boolean {
  const [matches, setMatches] = useState(defaultValue);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const handleChange = (event: MediaQueryListEvent) => setMatches(event.matches);
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
}
