import { PointerLight } from '@/components/motion/PointerLight';
import { TagList } from '@/components/ui/Tag';
import type { Project } from '@/content/schema';

type ProjectCardProps = {
  project: Project;
  /** Position in the ranked list, rendered as a mono index. */
  index: number;
};

/**
 * Flagship case study — the largest component on the site.
 *
 * Visual hierarchy is deliberate and comes straight from docs/01-PRD.md §9:
 * the title is loudest, and the OUTCOME is second — louder than the
 * description, the stack, or the links. A hiring manager scanning this section
 * should be able to read only the outcomes and still have learned the useful
 * thing.
 */
export function ProjectCard({ project, index }: ProjectCardProps) {
  const hasLinks = Boolean(project.liveHref ?? project.sourceHref);

  return (
    <article className="group/card">
      <PointerLight className="overflow-hidden rounded-(--radius-lg) border border-(--border-subtle) bg-(--surface-raised) shadow-(--e1) transition-[border-color,box-shadow,translate] duration-(--dur-base) ease-(--ease-standard) hover:-translate-y-0.5 hover:border-(--border-interactive) hover:shadow-(--e2)">
        {/* Media box. Space is reserved by aspect-ratio before anything loads,
            so this contributes nothing to CLS. */}
        <div className="relative aspect-16/10 overflow-hidden border-b border-(--border-subtle) bg-(--surface-void)">
          {project.media ? (
            <img
              src={project.media.src}
              alt={project.media.alt}
              width={project.media.width}
              height={project.media.height}
              loading="lazy"
              decoding="async"
              className="size-full object-cover transition-transform duration-(--dur-slow) ease-(--ease-standard) group-hover/card:scale-[1.03]"
            />
          ) : (
            /* No screenshot yet. A composed panel rather than a grey box or a
               fabricated mockup — it reads as intentional, and swaps out for
               real media with no layout change. */
            <div
              className="size-full transition-transform duration-(--dur-slow) ease-(--ease-standard) group-hover/card:scale-[1.03]"
              style={{
                background:
                  'radial-gradient(ellipse 80% 70% at 50% 120%, var(--color-crimson-950) 0%, transparent 70%)',
              }}
            >
              <span
                aria-hidden="true"
                data-decorative
                className="t-label absolute right-6 bottom-5 text-[clamp(3rem,8vw,6rem)] leading-none tracking-tight text-(--border-subtle)"
                data-numeric
              >
                {String(index).padStart(2, '0')}
              </span>
            </div>
          )}

          <div
            aria-hidden="true"
            data-decorative
            className="pointer-events-none absolute inset-0"
            style={{ background: 'linear-gradient(180deg, transparent 55%, var(--scrim) 100%)' }}
          />
        </div>

        <div className="p-6 sm:p-8">
          <p className="t-label flex items-center gap-3 text-(--text-tertiary)">
            <span data-numeric>{String(index).padStart(2, '0')}</span>
            <span aria-hidden="true">—</span>
            <span>{project.role}</span>
            <span aria-hidden="true">·</span>
            <time data-numeric>{project.timeframe}</time>
          </p>

          <h3 className="t-heading-2 mt-4 text-(--text-primary)">{project.title}</h3>

          <p className="t-body-lg mt-4 max-w-[52ch] text-(--text-primary)">{project.outcome}</p>

          <p className="t-body mt-3 max-w-[62ch] text-(--text-secondary)">{project.problem}</p>

          <TagList items={project.stack} label={`Technologies used in ${project.title}`} className="mt-6" />

          {hasLinks && (
            <div className="mt-7 flex flex-wrap gap-3">
              {project.liveHref && (
                <a
                  href={project.liveHref}
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-(--text-primary) px-5 text-[0.9375rem] font-medium text-(--surface-void) transition-[translate,box-shadow] duration-(--dur-fast) ease-(--ease-standard) hover:-translate-y-px hover:shadow-(--glow-md)"
                >
                  {/* Descriptive link text — never "click here" or a bare arrow. */}
                  Visit {project.title}
                  <ArrowIcon />
                </a>
              )}
              {project.sourceHref && (
                <a
                  href={project.sourceHref}
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-(--border-subtle) px-5 text-[0.9375rem] font-medium text-(--text-primary) transition-colors duration-(--dur-fast) ease-(--ease-standard) hover:border-(--border-interactive) hover:bg-(--hover-fill-subtle)"
                >
                  Source for {project.title}
                </a>
              )}
            </div>
          )}
        </div>
      </PointerLight>
    </article>
  );
}

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M3 11L11 3M11 3H5M11 3v6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
