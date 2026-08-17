import { Container } from '@/components/layout/Container';
import { getProfile } from '@/lib/content';
import { DESKTOP_TIER } from '@/lib/hero/tiers';

/**
 * The last thing anyone sees.
 *
 * Deliberately NOT a three-column sitemap. On a single-page site with a
 * persistent nav, a footer that repeats the same five section links is pure
 * duplication — it fills space without adding a single thing the reader could
 * not already do. Removing it is the whole point.
 *
 * What replaces it is a colophon of measured facts about the page just read.
 * For an engineering audience that is the only footer content that does any
 * work: it demonstrates the craft instead of asserting it, and every number is
 * checkable by opening devtools. The frame figures come from the hero manifest
 * rather than from prose, so they cannot drift away from what actually shipped.
 *
 * No motion. The page has said what it came to say. Back-to-top is a plain
 * anchor, so it works before hydration and respects the reader's own scroll
 * settings instead of overriding them.
 */
export function Footer() {
  const profile = getProfile();
  const visibleSocials = profile.socials.filter((social) => social.visible);
  const decodedMB = Math.round((DESKTOP_TIER.width * DESKTOP_TIER.height * 4 * DESKTOP_TIER.frames) / 1048576);

  const links = [
    { label: 'Email', href: `mailto:${profile.email}` },
    ...visibleSocials.map((social) => ({ label: social.label, href: social.href })),
    { label: 'Resume', href: profile.resumeHref },
  ];

  return (
    <footer className="relative overflow-hidden">
      {/*
        The lights going down. The page has been lit by one crimson key from the
        hero onward; this is that light finally leaving the room, resolving to
        true void rather than to the page grey. It is the only gradient here.
      */}
      <div
        aria-hidden="true"
        data-decorative
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, transparent 0%, rgb(9 6 7 / 0.55) 55%, var(--surface-void) 100%)',
        }}
      />

      <div className="relative">
        <Container size="wide">
          <div className="hairline" data-decorative />
        </Container>

        <Container size="wide">
          <div className="py-[clamp(4rem,3rem+6vw,9rem)]">
            <p className="t-display-2 max-w-[16ch] text-balance text-(--text-primary)">
              Thanks for scrolling.
            </p>

            <p className="t-body-lg mt-6 max-w-[46ch] text-(--text-secondary)">
              If any of it was useful, the fastest way to reach me is{' '}
              <a
                href={`mailto:${profile.email}`}
                className="text-(--text-primary) underline decoration-(--border-interactive) underline-offset-4 transition-colors duration-(--dur-fast) hover:decoration-(--accent)"
              >
                {profile.email}
              </a>
              . I answer everything.
            </p>

            <ul className="mt-8 flex flex-wrap gap-x-6">
              {links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    {...(link.label === 'Resume' ? { download: true } : {})}
                    {...(link.href.startsWith('http') ? { rel: 'me noopener' } : {})}
                    className="t-body-sm -mx-3 inline-flex min-h-11 items-center px-3 text-(--text-secondary) underline-offset-4 transition-colors duration-(--dur-fast) hover:text-(--text-primary) hover:underline"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>

            {/*
              The colophon. Every figure is derived or architectural, never
              typed from memory — a footer that boasts a stale number is worse
              than one that says nothing.
            */}
            <dl className="t-caption mt-16 grid gap-x-10 gap-y-6 border-t border-(--border-subtle) pt-8 text-(--text-tertiary) sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <dt className="t-label">Introduction</dt>
                <dd className="mt-2 text-(--text-secondary)">
                  <span data-numeric>{DESKTOP_TIER.frames}</span> frames at{' '}
                  <span data-numeric>
                    {DESKTOP_TIER.width}×{DESKTOP_TIER.height}
                  </span>
                  , scrubbed on one animation frame loop.
                </dd>
              </div>

              <div>
                <dt className="t-label">Budget</dt>
                <dd className="mt-2 text-(--text-secondary)">
                  <span data-numeric>{decodedMB} MB</span> of decoded frames held
                  in memory. Content sections ship no JavaScript at all.
                </dd>
              </div>

              <div>
                <dt className="t-label">Type</dt>
                <dd className="mt-2 text-(--text-secondary)">
                  Satoshi and JetBrains Mono, self-hosted in two files.
                </dd>
              </div>

              <div>
                <dt className="t-label">Colour</dt>
                <dd className="mt-2 text-(--text-secondary)">
                  Sampled from the footage above. Body text measures at least{' '}
                  <span data-numeric>7:1</span>.
                </dd>
              </div>
            </dl>

            <div className="mt-12 flex flex-wrap items-center justify-between gap-4">
              <p className="t-label text-(--text-tertiary)">
                <span data-numeric>{new Date().getFullYear()}</span>
                <span aria-hidden="true"> · </span>
                <span>{profile.name}</span>
              </p>

              <a
                href="#hero"
                className="t-label -mx-3 inline-flex min-h-11 items-center gap-2 px-3 text-(--text-secondary) underline-offset-4 transition-colors duration-(--dur-fast) hover:text-(--text-primary) hover:underline"
              >
                Back to the top
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path
                    d="M6 10V2m0 0L2.5 5.5M6 2l3.5 3.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </div>
          </div>
        </Container>
      </div>
    </footer>
  );
}
