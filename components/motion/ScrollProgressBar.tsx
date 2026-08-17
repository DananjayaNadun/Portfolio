'use client';

import { useRef } from 'react';
import { useFrame } from '@/hooks/useFrame';
import { useIsomorphicResizeObserver } from '@/hooks/useIsomorphicResizeObserver';

/**
 * A 1px hairline at the very top of the viewport showing document progress.
 *
 * Decorative and `aria-hidden` — the accessible equivalent is `aria-current`
 * on the nav item. Screen-reader users get position from structure, not from a
 * bar they cannot see.
 *
 * Writes `transform` straight to the DOM from the shared ticker. No React state
 * is involved, so scrolling the page causes zero renders.
 */
export function ScrollProgressBar() {
  const barRef = useRef<HTMLDivElement>(null);

  /**
   * Scroll height is cached. Reading `scrollHeight` inside the frame callback
   * would force a synchronous layout on every single frame — the exact thing
   * the two-phase ticker exists to prevent.
   */
  const scrollableRef = useRef(0);

  useIsomorphicResizeObserver(() => {
    scrollableRef.current = Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight
    );
  });

  useFrame(({ scrollY }) => {
    const bar = barRef.current;
    if (!bar) return;

    const scrollable = scrollableRef.current;
    const progress = scrollable > 0 ? Math.min(scrollY / scrollable, 1) : 0;
    bar.style.transform = `scaleX(${progress})`;
  });

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[90] h-px"
      aria-hidden="true"
      data-decorative
    >
      <div
        ref={barRef}
        className="h-full origin-left bg-(--accent) will-change-transform"
        style={{ transform: 'scaleX(0)' }}
      />
    </div>
  );
}
