import { cn } from '@/lib/utils/cn';

type TagListProps = {
  items: readonly string[];
  className?: string;
  /** Names the list for screen readers, e.g. "Technologies used". */
  label: string;
};

/**
 * Stack chips.
 *
 * A real list, so assistive technology announces the count instead of reading
 * a run of loose words. Sentence case is deliberate — uppercasing turns
 * "TypeScript" into "TYPESCRIPT", which loses the capitalisation the name
 * actually carries and is measurably harder to read.
 *
 * Non-interactive by design: these are labels, not filters.
 */
export function TagList({ items, className, label }: TagListProps) {
  return (
    <ul aria-label={label} className={cn('flex flex-wrap gap-2', className)}>
      {items.map((item) => (
        <li
          key={item}
          className="flex h-7 items-center rounded-(--radius-xs) border border-(--border-subtle) bg-(--hover-fill-subtle) px-2.5 text-[0.8125rem] text-(--text-secondary)"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
