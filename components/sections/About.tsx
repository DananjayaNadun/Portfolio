import { Reveal } from '@/components/motion/Reveal';
import { Section } from '@/components/layout/Section';
import { getProfile } from '@/lib/content';

/**
 * Act II — Voice.
 *
 * The first time the site speaks in the first person, and the shortest section
 * on the page. After the hero's spectacle the register drops to a person
 * talking: no media, no ornament, one column of text at a readable measure.
 *
 * A server component throughout. Only the <Reveal> wrappers hydrate, so the
 * prose itself ships zero client JavaScript.
 */
export function About() {
  const profile = getProfile();
  const [lead, ...rest] = profile.about;

  return (
    <Section id="about" index="02" label="About" title="A person, not a profile" size="prose">
      <div className="flex flex-col gap-6">
        {lead && (
          <Reveal>
            <p className="t-body-lg text-(--text-primary)">{lead}</p>
          </Reveal>
        )}

        {rest.map((paragraph, index) => (
          <Reveal key={paragraph.slice(0, 32)} delayMs={(index + 1) * 60}>
            <p className="t-body text-(--text-secondary)">{paragraph}</p>
          </Reveal>
        ))}
      </div>

      <Reveal delayMs={(rest.length + 1) * 60} className="mt-10">
        <dl className="grid grid-cols-2 gap-x-8 gap-y-5 border-t border-(--border-subtle) pt-8 sm:grid-cols-3">
          <div>
            <dt className="t-label text-(--text-tertiary)">Based in</dt>
            <dd className="t-body-sm mt-1.5 text-(--text-primary)">{profile.location}</dd>
          </div>
          <div>
            <dt className="t-label text-(--text-tertiary)">Focus</dt>
            <dd className="t-body-sm mt-1.5 text-(--text-primary)">{profile.role}</dd>
          </div>
          <div className="max-sm:col-span-2">
            <dt className="t-label text-(--text-tertiary)">Status</dt>
            <dd className="t-body-sm mt-1.5 flex items-center gap-2.5 text-(--text-primary)">
              {profile.availability === 'available' && (
                <span
                  aria-hidden="true"
                  data-decorative
                  className="size-2 shrink-0 rounded-full bg-(--color-jade-400)"
                />
              )}
              {/* Status is carried by the text. The dot is decoration, never
                  the sole signal — colour alone fails WCAG 1.4.1. */}
              {profile.availabilityLabel}
            </dd>
          </div>
        </dl>
      </Reveal>
    </Section>
  );
}
