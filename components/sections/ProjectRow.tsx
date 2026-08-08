import type { Project } from '@/content/schema';

type ProjectRowProps = {
  project: Project;
  index: number;
};

/**
 * Compact secondary work.
 *
 * The whole row is a single link with one accessible name, rather than a row
 * containing several competing links — a screen-reader user tabbing this list
 * should hear one entry per project, not three.
 *
 * When a project has no URL yet the row renders as plain content rather than a
 * link to nowhere. A dead demo link is the frustration hiring managers name
 * most often (docs/01-PRD.md §4).
 */
export function ProjectRow({ project, index }: ProjectRowProps) {
  const href = project.liveHref ?? project.sourceHref;

  const content = (
    <>
      <span className="t-label w-8 shrink-0 text-(--text-tertiary)" data-numeric>
        {String(index).padStart(2, '0')}
      </span>

      <span className="min-w-0 flex-1">
        <span className="t-heading-3 block text-(--text-primary) transition-transform duration-(--dur-base) ease-(--ease-standard) group-hover/row:translate-x-1">
          {project.title}
        </span>
        <span className="t-body-sm mt-1 block text-(--text-secondary)">{project.outcome}</span>
      </span>

      <span className="t-caption hidden shrink-0 text-(--text-tertiary) md:block">
        {project.stack.slice(0, 3).join(' · ')}
      </span>

      {href && (
        <span className="shrink-0 text-(--text-tertiary) transition-transform duration-(--dur-base) ease-(--ease-standard) group-hover/row:translate-x-1">
          <ArrowIcon />
        </span>
      )}
    </>
  );

  const shared =
    'group/row relative flex items-start gap-5 py-6 md:items-center';

  if (!href) {
    return <div className={shared}>{content}</div>;
  }

  return (
    <a href={href} className={`${shared} rounded-(--radius-sm)`}>
      {content}
      {/* Crimson hairline wipes in from the left. A scaleX transform on a
          pseudo-element — compositor-only, and never an animated width. */}
      <span
        aria-hidden="true"
        data-decorative
        className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-(--accent) transition-transform duration-(--dur-slow) ease-(--ease-standard) group-hover/row:scale-x-100"
      />
    </a>
  );
}

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3.5 8h9m0 0L9 4.5M12.5 8L9 11.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
