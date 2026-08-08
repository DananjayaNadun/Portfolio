import type { Profile, Project, Site } from '@/content/schema';

/**
 * Structured data derived from the same typed content the UI renders.
 *
 * Deriving rather than hand-authoring is the point: JSON-LD that is written
 * separately drifts from the visible page the first time a role or title
 * changes, and search engines treat that mismatch as a quality signal.
 */
export function buildPersonJsonLd(profile: Profile, site: Site) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    jobTitle: profile.role,
    description: profile.positioning,
    email: `mailto:${profile.email}`,
    url: site.url,
    address: { '@type': 'PostalAddress', addressLocality: profile.location },
    knowsAbout: profile.knowsAbout,
    sameAs: profile.socials.map((social) => social.href),
  } as const;
}

/**
 * One CreativeWork per flagship. Derived from the same object the card renders,
 * so the structured data cannot describe a project the page does not show.
 * `url` is omitted rather than faked when a project has no public link.
 */
export function buildProjectsJsonLd(projects: readonly Project[], profile: Profile) {
  return projects.map((project) => ({
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    abstract: project.tagline,
    description: project.outcome,
    creator: { '@type': 'Person', name: profile.name },
    keywords: project.stack.join(', '),
    ...(project.liveHref ? { url: project.liveHref } : {}),
  }));
}

export function buildWebSiteJsonLd(site: Site) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: site.title,
    description: site.description,
    url: site.url,
    inLanguage: site.locale,
  } as const;
}
