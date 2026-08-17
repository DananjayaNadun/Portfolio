'use client';

import { useRef } from 'react';
import { useFrame } from '@/hooks/useFrame';
import { useIsomorphicResizeObserver } from '@/hooks/useIsomorphicResizeObserver';

type ScrollDepthProps = {
  /** Section ids in document order. Ticks are placed at their real offsets. */
  sectionIds: readonly string[];
};

/**
 * A light travelling down a rail, with the reader's depth in the document.
 *
 * The percentage alone answers "how far" but not "how much further" — a reader
 * at 60% still cannot tell whether two sections remain or five. The ticks are
 * the actual sections at their actual document offsets, so the gap below the
 * marker is a truthful picture of what is left. That is the information this
 * carries; without it, it would be a number for decoration and would fail the
 * test in docs/03-MOTION-SYSTEM.md §8.
 *
 * Everything is written straight to the DOM from the shared ticker: transforms
 * for the marker and fill, and textContent for the readout only when the
 * integer actually changes. Scrolling the page causes zero React renders.
 *
 * `aria-hidden` — position is already carried for assistive technology by
 * landmarks, headings and `aria-current` in the nav. A screen reader user
 * gains nothing from a percentage they cannot see, and would have to hear it
 * announced on every scroll event.
 */
export function ScrollDepth({ sectionIds }: ScrollDepthProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const markerRef = useRef<HTMLDivElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);

  /** Cached so the frame callback never reads layout. */
  const geometry = useRef({ scrollable: 0, railHeight: 0 });
  const lastPercent = useRef(-1);
  const tickRefs = useRef<{ element: HTMLElement; fraction: number }[]>([]);

  useIsomorphicResizeObserver(() => {
    const rail = railRef.current;
    if (!rail) return;

    const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    geometry.current = { scrollable, railHeight: rail.offsetHeight };

    // Ticks track where sections genuinely sit, so they move when content does.
    for (const tick of tickRefs.current) {
      const target = document.getElementById(tick.element.dataset.tickFor ?? '');
      if (!target) continue;
      const top = target.getBoundingClientRect().top + window.scrollY;
      const fraction = Math.min(1, Math.max(0, top / scrollable));
      tick.element.style.transform = `translateY(${(fraction * rail.offsetHeight).toFixed(1)}px)`;
    }
  });

  useFrame(({ scrollY }) => {
    const { scrollable, railHeight } = geometry.current;
    const progress = Math.min(1, Math.max(0, scrollY / scrollable));

    const fill = fillRef.current;
    if (fill) fill.style.transform = `scaleY(${progress.toFixed(4)})`;

    const marker = markerRef.current;
    if (marker) marker.style.transform = `translateY(${(progress * railHeight).toFixed(1)}px)`;

    // The readout is text, so it is only touched when the visible value changes
    // — at most 101 writes over the whole document rather than one per frame.
    const percent = Math.round(progress * 100);
    if (percent !== lastPercent.current) {
      lastPercent.current = percent;
      const readout = readoutRef.current;
      if (readout) readout.textContent = String(percent).padStart(2, '0');
    }
  });

  return (
    <div
      aria-hidden="true"
      data-decorative
      className="pointer-events-none fixed top-1/2 right-6 z-[70] hidden -translate-y-1/2 lg:block"
    >
      <div ref={railRef} className="relative h-[38svh] w-px bg-(--color-ink-graphite)">
        {/* Travelled distance. scaleY on a 1px line — never an animated height. */}
        <span
          ref={fillRef}
          className="absolute inset-x-0 top-0 block h-full origin-top bg-(--accent) will-change-transform"
          style={{ transform: 'scaleY(0)' }}
        />

        {sectionIds.map((id) => (
          <span
            key={id}
            data-tick-for={id}
            ref={(element) => {
              if (element && !tickRefs.current.some((t) => t.element === element)) {
                tickRefs.current.push({ element, fraction: 0 });
              }
            }}
            className="absolute top-0 -left-1 block h-px w-2.5 bg-(--color-ink-graphite)"
          />
        ))}

        {/* The light itself, plus the depth it has reached. */}
        <div
          ref={markerRef}
          className="absolute top-0 left-1/2 will-change-transform"
          style={{ transform: 'translateY(0px)' }}
        >
          <span className="absolute top-0 left-0 block size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-(--accent) shadow-(--glow-sm)" />
          <span
            ref={readoutRef}
            data-numeric
            className="absolute top-0 right-3 block -translate-y-1/2 text-[0.6875rem] tracking-[0.14em] text-(--text-secondary) tabular-nums"
          >
            00
          </span>
        </div>
      </div>
    </div>
  );
}
