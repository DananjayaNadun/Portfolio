'use client';

import { useCallback, useRef, useState, type ReactNode } from 'react';
import { useFrame } from '@/hooks/useFrame';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils/cn';

type PointerLightProps = {
  children: ReactNode;
  className?: string;
};

/**
 * The crimson key light follows the reader's attention across a surface.
 *
 * This replaces a custom cursor (docs/03-MOTION-SYSTEM.md §8.2). A custom
 * cursor lags the real one by a frame, discards the OS affordances that carry
 * genuine meaning — the text I-beam, the resize arrows — and does nothing at
 * all on touch. This achieves the same intent, reinforces the site's single
 * light source, and costs two custom-property writes per frame.
 *
 * The element's rect is read once on pointer entry, never per frame. It is
 * viewport-relative, so it would go stale if the reader scrolled mid-hover —
 * the result is a few pixels of drift in a soft radial glow, which is not
 * perceptible, and it is the correct trade against a layout read every frame.
 */
export function PointerLight({ children, className }: PointerLightProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const [isActive, setIsActive] = useState(false);

  const hasFinePointer = useMediaQuery('(pointer: fine)');
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const isEnabled = hasFinePointer && !prefersReducedMotion;

  const handleEnter = useCallback(() => {
    if (!isEnabled) return;
    rectRef.current = hostRef.current?.getBoundingClientRect() ?? null;
    setIsActive(true);
  }, [isEnabled]);

  const handleLeave = useCallback(() => setIsActive(false), []);

  useFrame(({ pointerX, pointerY }) => {
    const host = hostRef.current;
    const rect = rectRef.current;
    if (!host || !rect) return;

    host.style.setProperty('--mx', `${(((pointerX - rect.left) / rect.width) * 100).toFixed(2)}%`);
    host.style.setProperty('--my', `${(((pointerY - rect.top) / rect.height) * 100).toFixed(2)}%`);
  }, isEnabled && isActive);

  return (
    <div
      ref={hostRef}
      onPointerEnter={handleEnter}
      onPointerLeave={handleLeave}
      className={cn('relative', className)}
      style={{ '--mx': '50%', '--my': '50%' } as React.CSSProperties}
    >
      {children}

      <div
        aria-hidden="true"
        data-decorative
        className={cn(
          'pointer-events-none absolute inset-0 transition-opacity duration-(--dur-slow) ease-(--ease-standard)',
          isActive ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          background:
            'radial-gradient(320px circle at var(--mx) var(--my), rgb(228 7 70 / 0.13), transparent 70%)',
        }}
      />
    </div>
  );
}
