import { z } from 'zod';

/**
 * The shape of every fact on the site.
 *
 * Schemas are parsed at build time, so malformed content fails the build rather
 * than shipping a broken card. They are also the reason SEO cannot drift from
 * the page: JSON-LD is derived from these same objects.
 *
 * Constraints here encode editorial rules from docs/01-PRD.md §9 — most
 * importantly that a project without a stated outcome is not a valid project.
 */

export const socialSchema = z.object({
  label: z.string().min(1),
  href: z.string().url(),
  /** Shown in the footer colophon; hidden entries stay in JSON-LD `sameAs`. */
  visible: z.boolean().default(true),
});

export const profileSchema = z.object({
  name: z.string().min(1),
  /** Current title. Appears in the hero sub-line and JSON-LD `jobTitle`. */
  role: z.string().min(1),
  /** One line, the loudest claim on the site. Kept short deliberately. */
  positioning: z.string().min(1).max(120),
  location: z.string().min(1),
  availability: z.enum(['available', 'open', 'unavailable']),
  availabilityLabel: z.string().min(1),
  email: z.string().email(),
  resumeHref: z.string().min(1),
  /** Two or three short paragraphs. Enforced short — PRD §9. */
  about: z.array(z.string().min(1)).min(1).max(3),
  knowsAbout: z.array(z.string().min(1)),
  socials: z.array(socialSchema),
});

export const projectSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  tagline: z.string().min(1),
  /** Legible to a non-engineer, with a number where one is true. PRD §9. */
  outcome: z.string().min(1),
  problem: z.string().min(1),
  role: z.string().min(1),
  timeframe: z.string().min(1),
  stack: z.array(z.string().min(1)).min(1),
  liveHref: z.string().url().optional(),
  sourceHref: z.string().url().optional(),
  media: z
    .object({
      src: z.string().min(1),
      alt: z.string().min(1),
      width: z.number().int().positive(),
      height: z.number().int().positive(),
    })
    .optional(),
  /** Flagships get case-study treatment; the rest render as compact rows. */
  tier: z.enum(['flagship', 'selected']),
});

export const skillGroupSchema = z.object({
  /** Depth of use, never a percentage. PRD §9. */
  depth: z.enum(['daily', 'production', 'familiar']),
  label: z.string().min(1),
  items: z.array(z.string().min(1)).min(1),
});

export const trajectoryEntrySchema = z.object({
  kind: z.enum(['role', 'education', 'certificate']),
  organisation: z.string().min(1),
  title: z.string().min(1),
  start: z.string().regex(/^\d{4}(\.\d{2})?$/),
  end: z.string().regex(/^\d{4}(\.\d{2})?$/).or(z.literal('present')),
  location: z.string().optional(),
  achievements: z.array(z.string().min(1)).max(3).default([]),
  credentialId: z.string().optional(),
  credentialHref: z.string().url().optional(),
});

export const siteSchema = z.object({
  url: z.string().url(),
  title: z.string().min(1),
  description: z.string().min(1).max(160),
  locale: z.string().min(2),
});

export type Social = z.infer<typeof socialSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type Project = z.infer<typeof projectSchema>;
export type SkillGroup = z.infer<typeof skillGroupSchema>;
export type TrajectoryEntry = z.infer<typeof trajectoryEntrySchema>;
export type Site = z.infer<typeof siteSchema>;
