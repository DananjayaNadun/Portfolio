import type { TrajectoryEntry } from '@/content/schema';
import { toDateTimeAttribute, toDisplayDate } from '@/lib/utils/date';
import { cn } from '@/lib/utils/cn';

type TimelineEntryProps = {
  entry: TrajectoryEntry;
};

/**
 * One node on the spine — a role, a qualification, or a credential.
 *
 * Certificates are marked by SHAPE (a diamond), not only by colour. A colour-only
 * distinction disappears for colour-blind readers and again in forced-colors
 * mode, where the OS replaces the palette wholesale.
 */
export function TimelineEntry({ entry }: TimelineEntryProps) {
  const isCertificate = entry.kind === 'certificate';
  const isOngoing = entry.end === 'present';
  const isSinglePoint = entry.start === entry.end;

  return (
    <li className="relative pb-10 last:pb-0">
      <span
        data-timeline-node
        data-lit="false"
        aria-hidden="true"
        data-decorative
        className={cn(
          'absolute top-2 -left-8 bg-(--color-ink-graphite) transition-[background-color,box-shadow] duration-(--dur-base) ease-(--ease-standard)',
          'data-[lit=true]:bg-(--accent) data-[lit=true]:shadow-(--glow-sm)',
          isCertificate ? 'size-2 rotate-45' : 'size-2.5 rounded-full'
        )}
        style={{ left: isCertificate ? '-1.9rem' : '-2rem' }}
      />

      <p className="t-label text-(--text-tertiary)">
        <time dateTime={toDateTimeAttribute(entry.start)} data-numeric>
          {toDisplayDate(entry.start)}
        </time>
        {!isSinglePoint && (
          <>
            <span aria-hidden="true"> — </span>
            {isOngoing ? (
              <span>Present</span>
            ) : (
              <time dateTime={toDateTimeAttribute(entry.end)} data-numeric>
                {toDisplayDate(entry.end)}
              </time>
            )}
          </>
        )}
        {entry.location && (
          <>
            <span aria-hidden="true"> · </span>
            <span>{entry.location}</span>
          </>
        )}
      </p>

      <h3 className="t-heading-3 mt-2 text-(--text-primary)">{entry.organisation}</h3>

      <p className="t-body-sm mt-0.5 text-(--text-secondary)">
        {entry.title}
        {entry.credentialId && (
          <>
            <span aria-hidden="true"> · </span>
            <span className="t-code text-(--text-tertiary)">{entry.credentialId}</span>
          </>
        )}
      </p>

      {entry.achievements.length > 0 && (
        <ul className="mt-4 flex flex-col gap-2">
          {entry.achievements.map((achievement) => (
            <li
              key={achievement.slice(0, 32)}
              className="t-body-sm relative pl-4 text-(--text-secondary) before:absolute before:top-[0.7em] before:left-0 before:size-1 before:rounded-full before:bg-(--border-interactive) before:content-['']"
            >
              {achievement}
            </li>
          ))}
        </ul>
      )}

      {entry.credentialHref && (
        <a
          href={entry.credentialHref}
          className="t-body-sm mt-3 inline-block text-(--accent-text) underline-offset-4 hover:underline"
        >
          Verify {entry.title} credential
        </a>
      )}
    </li>
  );
}
