import type { MetadataRoute } from 'next';
import { getSite } from '@/lib/content';

/**
 * AI crawlers are allowed deliberately (docs/01-PRD.md §14).
 *
 * For a personal portfolio, being citable by an assistant is a distribution
 * channel, not a leak — the whole document is public by design and exists to be
 * found. The default reflex to block them costs reach and protects nothing.
 */
export default function robots(): MetadataRoute.Robots {
  const site = getSite();

  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
