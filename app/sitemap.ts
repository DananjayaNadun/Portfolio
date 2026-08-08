import type { MetadataRoute } from 'next';
import { getSite } from '@/lib/content';

/**
 * Generated at build from the canonical URL in content/site.ts, so the sitemap
 * cannot disagree with the canonical tags or the OG URLs.
 *
 * A single-page site with one entry looks trivial, but it exists so the deep
 * case-study route reserved in docs/04-ARCHITECTURE.md §2 can be added here
 * without anyone having to remember that a sitemap was needed.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const site = getSite();

  return [
    {
      url: site.url,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ];
}
