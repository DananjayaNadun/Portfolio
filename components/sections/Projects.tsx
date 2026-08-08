import { Reveal } from '@/components/motion/Reveal';
import { Section } from '@/components/layout/Section';
import { ProjectCard } from './ProjectCard';
import { ProjectRow } from './ProjectRow';
import { getFlagshipProjects, getSelectedProjects } from '@/lib/content';

/**
 * Act III — Evidence. The site's loudest moment, and the only one.
 *
 * Ranked rather than gridded: two flagships get disproportionate space, and
 * everything else is a dense list. Twelve projects of equal weight communicate
 * that the author cannot tell which of their own work matters.
 *
 * Stagger is capped: flagships at 80ms apart, rows at 40ms and only for the
 * first six, after which they share the final delay. A nine-item list at full
 * stagger would put the last row half a second behind the first, which reads
 * as broken rather than choreographed.
 */
export function Projects() {
  const flagships = getFlagshipProjects();
  const selected = getSelectedProjects();

  return (
    <Section id="work" index="03" label="Work" title="Selected work" size="wide">
      <div className="flex flex-col gap-6 lg:gap-8">
        {flagships.map((project, index) => (
          <Reveal key={project.slug} delayMs={index * 80}>
            <ProjectCard project={project} index={index + 1} />
          </Reveal>
        ))}
      </div>

      {selected.length > 0 && (
        <div className="mt-16">
          <Reveal>
            <h3 className="t-label text-(--text-tertiary)">Also built</h3>
          </Reveal>

          <ul className="mt-2 divide-y divide-(--border-subtle) border-t border-(--border-subtle)">
            {selected.map((project, index) => (
              <li key={project.slug}>
                <Reveal delayMs={Math.min(index, 5) * 40}>
                  <ProjectRow project={project} index={flagships.length + index + 1} />
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Section>
  );
}
