'use client';

import { useEffect, useState } from 'react';

/**
 * Reports which section currently owns the viewport, for nav `aria-current`.
 *
 * Uses IntersectionObserver rather than comparing scroll offsets: offset maths
 * has to be recalculated on every resize and font swap, and it silently drifts
 * when section heights are fluid — which all of ours are.
 *
 * Ties are broken by document order among intersecting sections, so scrolling
 * through a boundary never flickers between two active items.
 */
export function useActiveSection(ids: readonly string[]): string | null {
  /**
   * Starts null, not `ids[0]`. The hero is not in this list, so seeding the
   * first section would mark "About" as current while the reader is still at
   * the top of the page — claiming a position they have not reached.
   */
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);

    if (elements.length === 0) return;

    const visible = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        // Nothing in the band means the reader is in the hero or the footer;
        // no nav item should claim to be current there.
        setActiveId(ids.find((id) => visible.has(id)) ?? null);
      },
      {
        // A band across the middle of the viewport. A section becomes active
        // when it occupies the reader's actual centre of attention, not when
        // its first pixel appears.
        rootMargin: '-45% 0px -45% 0px',
        threshold: 0,
      }
    );

    for (const element of elements) observer.observe(element);
    return () => observer.disconnect();
  }, [ids]);

  return activeId;
}
