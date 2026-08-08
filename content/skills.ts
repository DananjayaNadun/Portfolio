import { skillGroupSchema, type SkillGroup } from './schema';

/**
 * PLACEHOLDER CONTENT — awaiting docs/01-PRD.md §18.
 *
 * Grouped by depth of use, never by percentage. "React — 85%" is unfalsifiable,
 * invites comparison against a scale nobody defined, and reads as junior. Depth
 * is a claim a reader can actually evaluate: it says how often you touch the
 * thing, which is the question they were really asking.
 */
export const skillGroups: SkillGroup[] = [
  {
    depth: 'daily',
    label: 'Daily',
    items: ['TypeScript', 'React', 'Next.js', 'CSS', 'Node.js', 'Git'],
  },
  {
    depth: 'production',
    label: 'Shipped to production',
    items: ['PostgreSQL', 'Rust', 'WebGL', 'Playwright', 'AWS', 'Docker', 'GraphQL'],
  },
  {
    depth: 'familiar',
    label: 'Familiar',
    items: ['Go', 'Swift', 'Terraform', 'ClickHouse', 'Figma'],
  },
].map((group) => skillGroupSchema.parse(group));
