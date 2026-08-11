import type { ReactNode } from 'react';
import { Container } from './Container';
import { cn } from '@/lib/utils/cn';

type SectionProps = {
  /** Doubles as the anchor target and the key for nav active state. */
  id: string;
  /** Short uppercase label for the eyebrow, e.g. "About". */
  label: string;
  /** Two-digit index. Encodes real reading order, not decoration. */
  index: string;
  /** The section's actual heading. Required — a section cannot be unlabelled. */
  title: string;
  children: ReactNode;
  size?: 'prose' | 'default' | 'wide' | 'full';
  /** Hero and Contact are lit rather than ruled, so they omit the divider. */
  divider?: boolean;
  className?: string;
};

/**
 * The structural unit of the page.
 *
 * Requiring `id`, `label`, `index` and `title` is deliberate: it makes it
 * impossible to add a section without a landmark and an accessible name. The
 * heading is wired to `aria-labelledby` here so no caller has to remember.
 *
 * The eyebrow lockup (mono index — em dash — uppercase label) repeats in every
 * section. That repetition is the spine that holds a cinematic page together.
 */
export function Section({
  id,
  label,
  index,
  title,
  children,
  size = 'default',
  divider = true,
  className,
}: SectionProps) {
  const headingId = `${id}-title`;

  return (
    <section id={id} aria-labelledby={headingId} className={cn('relative', className)}>
      {divider && (
        <Container size="wide">
          <div className="hairline" data-decorative />
        </Container>
      )}

      <div className="py-(--section-py)">
        <Container size={size}>
          <p className="t-label flex items-center gap-3 text-(--text-tertiary)">
            <span data-numeric>{index}</span>
            <span aria-hidden="true">—</span>
            <span>{label}</span>
          </p>

          <h2 id={headingId} className="t-heading-1 mt-4 text-(--text-primary)">
            {title}
          </h2>

          <div className="mt-(--section-gap)">{children}</div>
        </Container>
      </div>
    </section>
  );
}
