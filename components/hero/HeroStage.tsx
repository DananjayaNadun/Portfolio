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
      <div className="sticky top-0 h-svh overflow-hidden">
        {/* The crimson key, spanning the full width so the field — not the
            photograph — is what reaches the screen edges. */}
        <div
          ref={bloomRef}
          aria-hidden="true"
          data-decorative
          className="pointer-events-none absolute inset-x-[-10%] bottom-[-30%] h-[85%] opacity-[0.18]"
          style={{
            background:
              'radial-gradient(ellipse 46% 52% at 50% 100%, var(--color-crimson-900) 0%, transparent 74%)',
          }}
        />

        {/*
          The portrait is the background, capped at its own native width.

          720px is the source width, so `min(720px, …)` is the largest this can
          be drawn without resampling: at that size the cover factor is exactly
          1.0 and every pixel is a real one. Going edge-to-edge on a 1920px
          screen would mean a 2.67x upscale of footage that does not contain the
          detail — which is what read as blur. The field carries the composition
          to the edges instead, and the photograph stays sharp.
        */}
        {/* Centred with `inset-x-0` + `mx-auto` rather than a translate, so the
            figure holds no transform of its own — the canvas inside is already
            the most expensive thing on the page to composite. */}
        <figure className="absolute inset-x-0 inset-y-0 z-0 mx-auto w-[min(720px,58vw)] overflow-hidden max-lg:w-full">
          {/*
            The LCP element. A server-rendered <picture>, not the canvas —
            making the canvas the LCP would put hydration plus a multi-megabyte
            decode on the critical path and put >95 mobile out of reach.

            Art direction, not just resolution: wide viewports get the first
            frame so the scrub starts where the poster left off, narrow ones get
            the final frame, which is the strongest single still.

            Raw <picture> rather than next/image: these are already optimally
            encoded WebP at their display size, and next/image cannot do art
            direction across breakpoints.
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
                'size-full object-cover object-[50%_28%] transition-opacity duration-(--dur-slow) ease-(--ease-standard)',
                scrubbing && 'opacity-0'
              )}
            />
          </picture>

          <canvas
            ref={canvasRef}
            aria-hidden="true"
            className={cn(
              'absolute inset-0 size-full transition-opacity duration-(--dur-slow) ease-(--ease-standard)',
              scrubbing ? 'opacity-100' : 'opacity-0'
            )}
          />

          {/* Feathers the photograph's own edges into the field, so it reads as
              a lit background rather than a picture pasted onto one. */}
          <div
            aria-hidden="true"
            data-decorative
            className="pointer-events-none absolute inset-0"
            style={{
              // Symmetric, and narrow. This only has to dissolve the two
              // vertical cut lines; anything wider starts eating the subject,
              // and the subject is the entire point of the sequence.
              background:
                'linear-gradient(90deg, var(--surface-page) 0%, rgb(13 10 11 / 0.35) 9%, transparent 22%, transparent 78%, rgb(13 10 11 / 0.35) 91%, var(--surface-page) 100%)',
            }}
          />
          <div
            aria-hidden="true"
            data-decorative
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgb(13 10 11 / 0.75) 0%, transparent 22%, transparent 62%, var(--surface-page) 100%)',
            }}
          />
        </figure>

        {/*
          Contrast protection for the copy column. Body text must clear 7:1 and
          no photograph can guarantee that, so the left third is held near-solid
          regardless of what the frame is doing behind it.
        */}
        <div
          aria-hidden="true"
          data-decorative
          className="pointer-events-none absolute inset-0 z-[5]"
          style={{
            // Reaches only as far as the copy column actually runs (~34ch, so
            // under 600px even on a wide screen). It previously cleared at 62%
            // of the viewport, which was fine when the portrait sat on the
            // right — once the figure was centred, that same scrim was sitting
            // on top of the subject's left half and hiding the animation.
            background:
              'linear-gradient(90deg, rgb(13 10 11 / 0.9) 0%, rgb(13 10 11 / 0.6) 22%, transparent 42%)',
          }}
        />

        <div className="relative z-10 h-full">{children}</div>

        <div
          aria-hidden="true"
          data-decorative
          className="pointer-events-none absolute inset-0 z-20"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 58%, rgb(9 6 7 / 0.5) 100%)',
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

/**
 * Fraction of the track spent scrubbing. The remainder holds the final frame.
 *
 * Without this the sequence completed at the exact pixel the sticky stage
 * unpinned — and because the frame index is damped it always trails the scroll,
 * so it never actually arrived. Scrolling at ~3000px/s, the 220ms settle puts
 * the index roughly ten frames behind, meaning the stage released around frame
 * 58 of 68 and the last ten — the ones where he meets the reader's eye, the
 * entire point of the sequence — were never drawn.
 *
 * The tail gives damping room to catch up and holds eye contact for a beat
 * before About arrives, which is what the gesture was always for.
 */
const SCRUB_END = 0.84;

/** Scroll progress through the track, 0 at the top, 1 before the stage releases. */
function readProgress(track: HTMLElement): number {
  const total = track.offsetHeight - window.innerHeight;
  if (total <= 0) return 1;

  const raw = clamp(-track.getBoundingClientRect().top / total, 0, 1);
  return clamp(raw / SCRUB_END, 0, 1);
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
