'use client';

import { useEffect, useRef } from 'react';

/** Fires slightly before the element reaches the bottom edge, so the reveal
 *  reads as anticipation rather than as a reaction to arriving. */
const ROOT_MARGIN = '0px 0px -12% 0px';

/**
 * Reveals an element the first time it enters view, then stops observing.
 *
 * Three rules from docs/03-MOTION-SYSTEM.md, all easy to get wrong:
 *
 *  1. Fires once and unobserves. Re-animating on scroll-up is nauseating and
 *     burns frames for no information.
 *  2. If the element is ALREADY on screen when the observer registers, it
 *     renders final-state with NO transition. A recruiter deep-linking to
 *     #work must land on a finished section, never a frozen mid-animation one.
 *     IntersectionObserver's first delivery reports current state, so that
 *     delivery is the signal.
 *  3. Under reduced motion no observer is created at all.
 *
 * State is written as a data attribute, not React state, so revealing never
 * triggers a render.
 */
export function useRevealOnce<T extends HTMLElement>(delayMs = 0) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      element.dataset.reveal = 'instant';
      return;
    }

    if (delayMs > 0) element.style.setProperty('--reveal-delay', `${delayMs}ms`);

    let isFirstDelivery = true;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          element.dataset.reveal = isFirstDelivery ? 'instant' : 'visible';
          observer.disconnect();
          return;
        }
        isFirstDelivery = false;
      },
      { rootMargin: ROOT_MARGIN, threshold: 0 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [delayMs]);

  return ref;
}
