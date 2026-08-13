import { HeroStage } from './HeroStage';
import { Container } from '@/components/layout/Container';
import { getProfile } from '@/lib/content';

/**
 * Act I. Presence is established before anything is claimed.
 *
 * A server component: every word here is in the initial HTML, so the fast path
 * (name, role, positioning, and both calls to action readable without scrolling)
 * does not depend on hydration, and neither does SEO.
 *
 * The copy is passed to HeroStage as children, so the client boundary contains
 * only the canvas and the scroll binding — not the text.
 */
export function Hero() {
  const profile = getProfile();

  return (
    <section id="hero" aria-labelledby="hero-title" className="relative">
      <HeroStage posterAlt={`${profile.name}, ${profile.role}, photographed in low light.`}>
        <div className="flex h-full items-end pb-[clamp(72px,14vh,140px)] lg:items-center lg:pb-0">
          <Container size="wide">
            <div className="max-w-[34ch]">
              <p className="t-label flex items-center gap-3 text-(--text-tertiary)">
                <span data-numeric>01</span>
                <span aria-hidden="true">—</span>
                <span>Introduction</span>
              </p>

              <h1 id="hero-title" className="t-display-1 mt-5 text-(--text-primary)">
                {profile.name}
              </h1>

              <p className="t-body-lg mt-5 max-w-[38ch] text-(--text-secondary)">
                {profile.positioning}
              </p>

              {/* Staged: arrives as the subject becomes frontal. */}
              <p
                data-hero-stage
                className="t-label mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 text-(--text-tertiary)"
              >
                <span>{profile.role}</span>
                <span aria-hidden="true">·</span>
                <span>{profile.location}</span>
              </p>

              {/* Staged: arrives once eye contact is nearly made. */}
              <div data-hero-stage className="mt-8 flex flex-wrap gap-3.5">
                <a
                  href="#contact"
                  className="inline-flex h-12 items-center rounded-full bg-(--text-primary) px-6 text-[0.9375rem] font-medium text-(--surface-void) transition-[translate,box-shadow] duration-(--dur-fast) ease-(--ease-standard) hover:-translate-y-px hover:shadow-(--glow-md)"
                >
                  Get in touch
                </a>
                <a
                  href="#work"
                  className="inline-flex h-12 items-center rounded-full border border-(--border-interactive) px-6 text-[0.9375rem] font-medium text-(--text-primary) transition-colors duration-(--dur-fast) ease-(--ease-standard) hover:bg-(--hover-fill)"
                >
                  View work
                </a>
              </div>
            </div>
          </Container>
        </div>
      </HeroStage>
    </section>
  );
}
