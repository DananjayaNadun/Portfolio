'use client';

import type { ReactNode } from 'react';
import { useRevealOnce } from '@/hooks/useRevealOnce';
import { cn } from '@/lib/utils/cn';

type RevealProps = {
  /**
   * Server-rendered content. It arrives as an already-rendered ReactNode, so
   * the client bundle carries the animation and the HTML carries the words —
   * which is how the site gets full motion with almost no content in the JS.
   */
  children: ReactNode;
  /** Stagger offset in ms. Cap groups at 320ms total; past six items, stagger
   *  by row rather than by item. */
  delayMs?: number;
  /**
   * `rise` (default) fades and lifts by --rise. `fade` is opacity only.
   *
   * Skills uses `fade` deliberately: after the peak of Projects it is the
   * plainest region on the site, and travel there would undercut that.
   * Implemented by zeroing --rise locally rather than by a second CSS rule, so
   * both variants stay on one code path.
   */
  motion?: 'rise' | 'fade';
  className?: string;
};

export function Reveal({ children, delayMs = 0, motion = 'rise', className }: RevealProps) {
  const ref = useRevealOnce<HTMLDivElement>(delayMs);

  return (
    <div
      ref={ref}
      data-reveal="pending"
      className={cn(className)}
      {...(motion === 'fade' ? { style: { '--rise': '0px' } as React.CSSProperties } : {})}
    >
      {children}
    </div>
  );
}
