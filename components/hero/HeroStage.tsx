'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useFrame } from '@/hooks/useFrame';
import {
  failLoading,
  finishLoading,
  setLoadProgress,
  startLoading,
} from '@/lib/hero/load-progress';
import { HeroSequenceController } from '@/lib/hero/sequence-controller';
import {
  POSTER_END,
  POSTER_HEIGHT,
  POSTER_START,
  POSTER_WIDTH,
  readCapabilities,
  selectTier,
} from '@/lib/hero/tiers';
import { clamp, segment } from '@/lib/utils/clamp';
import { cn } from '@/lib/utils/cn';

/**
 * Copy stages, keyed to where the subject is in the turn rather than to time.
 * The sub-line lands as he becomes roughly frontal; the call to action lands
 * once eye contact is nearly made.
 *
 * The eyebrow, name and role are deliberately NOT staged. They are visible at
 * progress 0 and never animate in: a recruiter must be able to read who this is
 * without scrolling (docs/01-PRD.md §7), and staging them would have hidden the
 * name until 3.5% of the track had passed.
 */
const STAGES: readonly [from: number, to: number][] = [
  [0.3, 0.44],
  [0.62, 0.78],
];

type HeroStageProps = {
  /** Server-rendered copy. Elements carry data-hero-stage="0..3". */
  children: ReactNode;
  posterAlt: string;
};

export function HeroStage({ children, posterAlt }: HeroStageProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bloomRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const stagesRef = useRef<HTMLElement[]>([]);
  const controllerRef = useRef<HeroSequenceController | null>(null);

  const [scrubbing, setScrubbing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const track = trackRef.current;
    if (!canvas || !track) return;

    stagesRef.current = Array.from(track.querySelectorAll<HTMLElement>('[data-hero-stage]'));

    const tier = selectTier(readCapabilities());

    // Poster-only path. Nothing to decode, so the loading screen must not wait,
    // and the copy renders at its final state immediately — a still hero is a
    // finished design here, not a degraded one.
    if (!tier) {
      paintStages(stagesRef.current, 1);
      if (cueRef.current) cueRef.current.style.opacity = '0';
      finishLoading();
      return;
    }

    const controller = new HeroSequenceController(canvas, tier);
    controllerRef.current = controller;

    const observer = new ResizeObserver(() => {
      controller.resize();
      controller.renderAt(readProgress(track));
    });
    observer.observe(canvas);

    startLoading();

    let cancelled = false;
    controller
      .load((fraction) => setLoadProgress(fraction))
      .then(() => {
        if (cancelled) return;
        controller.resize();
        // Paint synchronously before handing over to the ticker. Without this
        // the canvas is blank until the first animation frame — a visible flash,
        // and never resolved at all if the tab is not compositing.
        controller.renderAt(readProgress(track));
        setScrubbing(true);
        finishLoading();

        // Development-only handle for deterministic verification. The rAF loop
        // is the only consumer in normal operation, but scroll-driven state is
        // untestable without a seam that renders a given progress on demand.
        // Stripped from production bundles by the constant condition.
        if (process.env.NODE_ENV !== 'production') {
          (window as unknown as { __hero?: unknown }).__hero = {
            renderAt: (p: number) => {
              controller.renderAt(p);
              paintStages(stagesRef.current, p);
              return controller.state;
            },
            state: () => controller.state,
          };
        }
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        failLoading(error instanceof Error ? error.message : 'Sequence failed to decode');
        paintStages(stagesRef.current, 1);
      });

    return () => {
      cancelled = true;
      observer.disconnect();
      controller.destroy();
      controllerRef.current = null;
    };
  }, []);

  useFrame(
    ({ dt }) => {
      const track = trackRef.current;
      const controller = controllerRef.current;
      if (!track) return;

      const progress = readProgress(track);
      controller?.update(progress, dt);
      paintStages(stagesRef.current, progress);

      const bloom = bloomRef.current;
      if (bloom) bloom.style.opacity = (0.18 + progress * 0.82).toFixed(3);

      // The cue fades out rather than in, so it is driven separately.
      const cue = cueRef.current;
      if (cue) cue.style.opacity = (1 - segment(progress, 0, 0.06)).toFixed(3);
    },
    scrubbing
  );

  return (
    <div
      ref={trackRef}
      className="relative h-svh motion-reduce:h-svh md:h-[600vh]"
      data-hero-track
    >
      <div className="sticky top-0 grid h-svh items-center overflow-hidden">
        <div
          ref={bloomRef}
          aria-hidden="true"
          data-decorative
          className="pointer-events-none absolute inset-x-[-20%] bottom-[-35%] h-[75%] opacity-[0.18]"
          style={{
            background:
              'radial-gradient(ellipse 50% 50% at 50% 100%, var(--color-crimson-900) 0%, transparent 72%)',
          }}
        />

        <div className="relative z-10 mx-auto grid h-full w-full max-w-(--container-wide) items-center gap-(--section-gap) px-(--gutter) lg:grid-cols-[1fr_auto]">
          {children}

          <figure className="relative order-first m-0 justify-self-center max-lg:absolute max-lg:inset-0 max-lg:w-full lg:order-none lg:h-[min(84svh,760px)] lg:w-auto lg:[aspect-ratio:480/853]">
            {/*
              The LCP element. A server-rendered <picture>, not the canvas —
              making the canvas the LCP would put hydration plus a multi-megabyte
              decode on the critical path and put >95 mobile out of reach.

              Art direction, not just resolution: wide viewports get the first
              frame so the scrub starts where the poster left off, narrow ones
              get the final frame, which is the strongest single still.

              Raw <picture> rather than next/image: these are already optimally
              encoded WebP at their display size, and next/image cannot do
              art direction across breakpoints.
            */}
            <picture>
              <source media="(min-width: 768px)" srcSet={POSTER_START} />
              <img
                src={POSTER_END}
                alt={posterAlt}
                width={POSTER_WIDTH}
                height={POSTER_HEIGHT}
                fetchPriority="high"
                decoding="async"
                className={cn(
                  'size-full object-cover transition-opacity duration-(--dur-slow) ease-(--ease-standard)',
                  'max-lg:object-[50%_38%] lg:rounded-[14px]',
                  scrubbing && 'opacity-0'
                )}
              />
            </picture>

            <canvas
              ref={canvasRef}
              aria-hidden="true"
              className={cn(
                'absolute inset-0 size-full transition-opacity duration-(--dur-slow) ease-(--ease-standard)',
                'lg:rounded-[14px]',
                scrubbing ? 'opacity-100' : 'opacity-0'
              )}
            />

            <div
              aria-hidden="true"
              data-decorative
              className="pointer-events-none absolute inset-0 lg:hidden"
              style={{
                background:
                  'linear-gradient(180deg, var(--scrim) 0%, var(--scrim-soft) 34%, var(--surface-veil) 100%)',
              }}
            />
          </figure>
        </div>

        <div
          aria-hidden="true"
          data-decorative
          className="pointer-events-none absolute inset-0 z-20"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 42%, rgb(9 6 7 / 0.72) 100%)',
          }}
        />

        <div
          ref={cueRef}
          aria-hidden="true"
          data-decorative
          className="t-label pointer-events-none absolute bottom-8 left-1/2 z-30 grid -translate-x-1/2 justify-items-center gap-2.5 text-(--text-tertiary)"
        >
          <span className="hero-cue-line block h-8 w-px" />
          Scroll
        </div>
      </div>
    </div>
  );
}

/** Scroll progress through the track, 0 at the top, 1 when the stage releases. */
function readProgress(track: HTMLElement): number {
  const total = track.offsetHeight - window.innerHeight;
  if (total <= 0) return 1;
  return clamp(-track.getBoundingClientRect().top / total, 0, 1);
}

function paintStages(elements: readonly HTMLElement[], progress: number): void {
  for (let i = 0; i < elements.length; i += 1) {
    const element = elements[i];
    const range = STAGES[i];
    if (!element || !range) continue;

    const t = segment(progress, range[0], range[1]);
    element.style.opacity = String(t);
    element.style.translate = `0 ${((1 - t) * 18).toFixed(2)}px`;
  }
}
