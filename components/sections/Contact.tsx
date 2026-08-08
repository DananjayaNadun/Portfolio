import { Reveal } from '@/components/motion/Reveal';
import { Container } from '@/components/layout/Container';
import { CopyEmailButton } from './CopyEmailButton';
import { getProfile } from '@/lib/content';

/**
 * Act V — Invitation.
 *
 * The lights come back down. This is the only section besides the hero that is
 * lit rather than ruled: no hairline divider, one crimson bloom, and the
 * largest type on the page after the name itself.
 *
 * There is deliberately no contact form. docs/01-PRD.md §4 names "contact forms
 * that don't tell her the email address" as a primary frustration for the P0
 * persona — a recruiter wants an address to paste into an applicant tracking
 * system, not a text box that emails someone else on her behalf. A form would
 * also add a backend, a spam surface, and a failure mode, in exchange for
 * nothing the reader wanted.
 *
 * The bloom is opacity on a static radial gradient. Animating gradient stops
 * re-rasterises the element every frame.
 */
export function Contact() {
  const profile = getProfile();
  const visibleSocials = profile.socials.filter((social) => social.visible);

  return (
    <section id="contact" aria-labelledby="contact-title" className="relative overflow-hidden">
      <div
        aria-hidden="true"
        data-decorative
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[70%]"
        style={{
          background:
            'radial-gradient(ellipse 60% 60% at 50% 100%, var(--color-crimson-900) 0%, transparent 70%)',
        }}
      />

      <div className="relative py-[clamp(6rem,4rem+10vw,14rem)]">
        <Container>
          <Reveal>
            <p className="t-label flex items-center gap-3 text-(--text-tertiary)">
              <span data-numeric>06</span>
              <span aria-hidden="true">—</span>
              <span>Contact</span>
            </p>
          </Reveal>

          <Reveal delayMs={60}>
            <h2 id="contact-title" className="t-display-2 mt-6 max-w-[16ch] text-(--text-primary)">
              Let&rsquo;s build something that lasts.
            </h2>
          </Reveal>

          <Reveal delayMs={120}>
            <p className="t-body-lg mt-6 max-w-[46ch] text-(--text-secondary)">
              {profile.availability === 'available'
                ? `${profile.availabilityLabel}. The fastest way to reach me is email — I answer everything.`
                : 'The fastest way to reach me is email.'}
            </p>
          </Reveal>

          <Reveal delayMs={180}>
            <div className="mt-10">
              {/* The address itself is the headline action, not a label on a
                  button. It is selectable, copyable, and readable at a glance. */}
              <a
                href={`mailto:${profile.email}`}
                className="t-heading-2 inline-block break-all text-(--text-primary) underline decoration-(--border-interactive) decoration-1 underline-offset-[6px] transition-colors duration-(--dur-fast) ease-(--ease-standard) hover:decoration-(--accent)"
              >
                {profile.email}
              </a>
            </div>
          </Reveal>

          <Reveal delayMs={240}>
            <div className="mt-8 flex flex-wrap gap-3.5">
              <a
                href={`mailto:${profile.email}`}
                className="inline-flex h-12 items-center gap-2 rounded-full bg-(--text-primary) px-6 text-[0.9375rem] font-medium text-(--surface-void) transition-[translate,box-shadow] duration-(--dur-fast) ease-(--ease-standard) hover:-translate-y-px hover:shadow-(--glow-md)"
              >
                Send an email
              </a>

              <CopyEmailButton email={profile.email} />

              <a
                href={profile.resumeHref}
                download
                className="inline-flex h-12 items-center gap-2 rounded-full border border-(--border-subtle) px-6 text-[0.9375rem] font-medium text-(--text-primary) transition-colors duration-(--dur-fast) ease-(--ease-standard) hover:border-(--border-interactive) hover:bg-(--hover-fill-subtle)"
              >
                Download resume
                <DownloadIcon />
              </a>
            </div>
          </Reveal>

          {visibleSocials.length > 0 && (
            <Reveal delayMs={300}>
              <ul className="mt-12 flex flex-wrap gap-x-8 gap-y-3">
                {visibleSocials.map((social) => (
                  <li key={social.href}>
                    <a
                      href={social.href}
                      rel="me noopener"
                      className="t-body-sm text-(--text-secondary) underline-offset-4 transition-colors duration-(--dur-fast) hover:text-(--text-primary) hover:underline"
                    >
                      {social.label}
                    </a>
                  </li>
                ))}
              </ul>
            </Reveal>
          )}
        </Container>
      </div>
    </section>
  );
}

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M7 1.5v7m0 0L4.25 5.75M7 8.5l2.75-2.75M2 10.5v1a1 1 0 001 1h8a1 1 0 001-1v-1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
