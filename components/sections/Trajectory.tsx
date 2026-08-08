import { Reveal } from '@/components/motion/Reveal';
import { Section } from '@/components/layout/Section';
import { TimelineEntry } from './TimelineEntry';
import { TimelineSpine } from './TimelineSpine';
import { getTrajectory } from '@/lib/content';

/**
 * Act IV — the road that produced the instrument set.
 *
 * This is the merge from docs/01-PRD.md §8.1: the brief asked for Journey,
 * Experience, Timeline AND Certificates as four sections, which would have made
 * a reader scroll past the same dates and employers four times in four
 * treatments. Here the narrative framing is the opening line, the roles are the
 * content, the timeline is the form, and certificates are nodes on the same
 * spine.
 *
 * An ordered list, because it is genuinely chronological — the order carries
 * information a reader needs, which is the test for whether sequence markup is
 * honest or decorative.
 */
export function Trajectory() {
  const entries = getTrajectory();

  return (
    <Section id="experience" index="05" label="Experience" title="Trajectory">
      <Reveal>
        <p className="t-body-lg max-w-[54ch] text-(--text-secondary)">
          Six years, three teams, and one consistent through-line: making things
          that stay fast once other people start using them.
        </p>
      </Reveal>

      <div className="mt-12">
        <TimelineSpine>
          <ol className="m-0 list-none p-0">
            {entries.map((entry) => (
              <TimelineEntry key={`${entry.organisation}-${entry.start}`} entry={entry} />
            ))}
          </ol>
        </TimelineSpine>
      </div>
    </Section>
  );
}
