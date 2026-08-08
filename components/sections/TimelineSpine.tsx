'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { useFrame } from '@/hooks/useFrame';
import { useIsomorphicResizeObserver } from '@/hooks/useIsomorphicResizeObserver';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { clamp } from '@/lib/utils/clamp';

/** Where in the viewport the spine's leading edge sits. Slightly below centre,
 *  so an entry lights up as it reaches the reader rather than after. */
const READ_LINE = 0.55;

type TimelineSpineProps = {
  /** The server-rendered list. Entries carry [data-timeline-node]. */
  children: ReactNode;
};

/**
 * A crimson spine that fills as the section is read, lighting each node it
 * passes.
 *
 * The fill is `transform: scaleY()` with `transform-origin: top` — never an
 * animated `height`, which is a layout property and would reflow every entry
 * below it on every frame.
 *
 * Geometry is cached. Node offsets come from `offsetTop` against the positioned
 * container and the container's document position is measured once, so the
 * frame callback reads no layout at all: progress is derived from `scrollY`
 * alone.
 */
export function TimelineSpine({ children }: TimelineSpineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const spineRef = useRef<HTMLSpanElement>(null);
  const nodesRef = useRef<{ element: HTMLElement; offset: number }[]>([]);
  const geometryRef = useRef({ documentTop: 0, height: 0 });

  const prefersReducedMotion = useReducedMotion();

  useIsomorphicResizeObserver(() => {
    const container = containerRef.current;
    if (!container) return;

    geometryRef.current = {
      documentTop: container.getBoundingClientRect().top + window.scrollY,
      height: container.offsetHeight,
    };

    nodesRef.current = Array.from(
      container.querySelectorAll<HTMLElement>('[data-timeline-node]')
    ).map((element) => ({ element, offset: element.offsetTop }));
  });

  // Reduced motion renders the finished state: the road was travelled, and
  // showing it fully lit is the honest picture. Nothing is lost by not animating.
  useEffect(() => {
    if (!prefersReducedMotion) return;
    if (spineRef.current) spineRef.current.style.transform = 'scaleY(1)';
    for (const { element } of nodesRef.current) element.dataset.lit = 'true';
  }, [prefersReducedMotion]);

  useFrame(({ scrollY, viewportHeight }) => {
    const spine = spineRef.current;
    const { documentTop, height } = geometryRef.current;
    if (!spine || height === 0) return;

    const progress = clamp((scrollY + viewportHeight * READ_LINE - documentTop) / height, 0, 1);
    spine.style.transform = `scaleY(${progress.toFixed(4)})`;

    const leadingEdge = progress * height;
    for (const { element, offset } of nodesRef.current) {
      const lit = offset <= leadingEdge ? 'true' : 'false';
      if (element.dataset.lit !== lit) element.dataset.lit = lit;
    }
  }, !prefersReducedMotion);

  return (
    <div ref={containerRef} className="relative pl-8">
      {/* Unlit rail. Non-text decoration, so ink-graphite at 1.9:1 is fine. */}
      <span
        aria-hidden="true"
        data-decorative
        className="absolute top-2 bottom-2 left-[3px] w-px bg-(--color-ink-graphite)"
      />
      <span
        ref={spineRef}
        aria-hidden="true"
        data-decorative
        className="absolute top-2 bottom-2 left-[3px] w-px origin-top bg-(--accent) will-change-transform"
        style={{ transform: 'scaleY(0)' }}
      />
      {children}
    </div>
  );
}
