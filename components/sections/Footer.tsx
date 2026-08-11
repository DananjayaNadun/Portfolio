import { Container } from '@/components/layout/Container';
import { getProfile, getSections } from '@/lib/content';

/**
 * The quiet close.
 *
 * No motion at all — the page has said what it came to say. Back-to-top is a
 * plain anchor rather than a scripted scroll: it works before hydration, it
 * works without JavaScript, and it respects the reader's own scroll settings
 * instead of overriding them.
 */
export function Footer() {
  const profile = getProfile();
  const sections = getSections();
  const visibleSocials = profile.socials.filter((social) => social.visible);

  return (
    <footer className="relative">
      <Container size="wide">
        <div className="hairline" data-decorative />
      </Container>

      <Container>
        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="t-heading-3 text-(--text-primary)">{profile.name}</p>
            <p className="t-body-sm mt-2 max-w-[34ch] text-(--text-secondary)">
              {profile.positioning}
            </p>
          </div>

          {/* Labels are <p>, not headings. These name two short link lists —
              navigational chrome — and promoting them to <h2> would put them in
              the document outline as peers of "Selected work". The lists get
              their accessible names via aria-labelledby instead. */}
          <nav aria-label="Footer">
            <p id="footer-sections" className="t-label text-(--text-tertiary)">
              Sections
            </p>
            <ul aria-labelledby="footer-sections" className="mt-4 flex flex-col gap-2.5">
              {sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="t-body-sm text-(--text-secondary) underline-offset-4 transition-colors duration-(--dur-fast) hover:text-(--text-primary) hover:underline"
                  >
                    {section.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p id="footer-elsewhere" className="t-label text-(--text-tertiary)">
              Elsewhere
            </p>
            <ul aria-labelledby="footer-elsewhere" className="mt-4 flex flex-col gap-2.5">
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
              <li>
                <a
                  href={`mailto:${profile.email}`}
                  className="t-body-sm text-(--text-secondary) underline-offset-4 transition-colors duration-(--dur-fast) hover:text-(--text-primary) hover:underline"
                >
                  Email
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-(--border-subtle) py-8">
          <p className="t-label text-(--text-tertiary)">
            <span data-numeric>{new Date().getFullYear()}</span>
            <span aria-hidden="true"> · </span>
            <span>Built with Next.js</span>
          </p>

          <a
            href="#hero"
            className="t-label text-(--text-secondary) underline-offset-4 transition-colors duration-(--dur-fast) hover:text-(--text-primary) hover:underline"
          >
            Back to top
          </a>
        </div>
      </Container>
    </footer>
  );
}
