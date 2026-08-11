import { siteSchema, type Site } from './schema';

/** PLACEHOLDER — the real domain is needed for canonicals, OG URLs and sitemap. */
export const site: Site = siteSchema.parse({
  url: 'https://example.com',
  title: 'Your Name — Software Engineer',
  description:
    'Portfolio of a software engineer building interfaces that hold up under load. Selected work, experience, and contact.',
  locale: 'en',
});

/**
 * The navigation model, and the single source of truth for section order.
 *
 * `id` is both the DOM id and the anchor target, so adding a section here and
 * rendering a <Section> with the matching id is all that is required to wire
 * navigation, active state, and deep linking.
 */
/**
 * Indices continue from the hero, which is 01. They encode real reading order —
 * this page is a sequence — rather than decorating each heading with a number.
 */
export const sections = [
  { id: 'about', label: 'About', index: '02' },
  { id: 'work', label: 'Work', index: '03' },
  { id: 'skills', label: 'Skills', index: '04' },
  { id: 'experience', label: 'Experience', index: '05' },
  { id: 'contact', label: 'Contact', index: '06' },
] as const;

export type SectionId = (typeof sections)[number]['id'];
