import { Reveal } from '@/components/motion/Reveal';
import { Section } from '@/components/layout/Section';
import { getSkillGroups } from '@/lib/content';

/**
 * Act IV — the instrument set, stated as fact.
 *
 * Deliberately the least animated region on the site: opacity only, no travel,
 * no stagger (docs/03-MOTION-SYSTEM.md §4.9). Coming straight after the loudest
 * section, its plainness is doing rhetorical work — a second climax here would
 * mean the page has none.
 *
 * Definition lists, not headings-plus-tags: the relationship between a depth
 * and its technologies is exactly what <dl> encodes, and screen readers
 * announce it as a pairing rather than as two unrelated runs of text.
 */
export function Skills() {
  const groups = getSkillGroups();

  return (
    <Section id="skills" index="04" label="Skills" title="Tools, by how often I reach for them">
      <Reveal motion="fade">
        <p className="t-body max-w-[62ch] text-(--text-secondary)">
          Grouped by depth of use rather than by a percentage. A number out of a
          hundred implies a scale nobody agreed on; this says how often each of
          these is actually in my hands.
        </p>
      </Reveal>

      <dl className="mt-12 flex flex-col gap-10">
        {groups.map((group) => (
          <Reveal key={group.depth} motion="fade">
            <div className="grid gap-4 border-t border-(--border-subtle) pt-6 md:grid-cols-[180px_1fr] md:gap-8">
              <dt className="t-label text-(--text-tertiary)">{group.label}</dt>
              <dd className="m-0">
                <ul className="flex flex-wrap gap-x-6 gap-y-3">
                  {group.items.map((item) => (
                    <li key={item} className="t-body text-(--text-primary)">
                      {item}
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          </Reveal>
        ))}
      </dl>
    </Section>
  );
}
