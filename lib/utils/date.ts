const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

/**
 * Content stores dates as `YYYY` or `YYYY.MM`, which is unambiguous to author
 * and trivially sortable. These convert to the two forms the UI needs: a valid
 * `datetime` attribute for machines, and a readable label for people.
 */
export function toDateTimeAttribute(value: string): string {
  return value.replace('.', '-');
}

export function toDisplayDate(value: string): string {
  const [year, month] = value.split('.');
  if (!year) return value;
  if (!month) return year;

  const index = Number(month) - 1;
  const name = MONTHS[index];
  return name ? `${name} ${year}` : year;
}
