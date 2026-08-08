import type { ReactNode } from 'react';
import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';

import '@/styles/globals.css';

import { Grain } from '@/components/layout/Grain';
import { SkipLink } from '@/components/layout/SkipLink';
import { Footer } from '@/components/sections/Footer';
import { LoadingScreen } from '@/components/sections/LoadingScreen';
import { Navigation } from '@/components/sections/Navigation';
import { getFlagshipProjects, getProfile, getSections, getSite } from '@/lib/content';
import { buildPersonJsonLd, buildProjectsJsonLd, buildWebSiteJsonLd } from '@/lib/seo/jsonld';

/**
 * Self-hosted variable faces. `next/font/local` derives fallback metrics and
 * emits `size-adjust`/`ascent-override`, so the swap from the system fallback
 * causes no layout shift — which is how CLS stays at 0.00 with a webfont.
 *
 * Satoshi has no static 600 weight (it ships 300/400/500/700/900); the variable
 * cut is what makes the heading weight in the type scale real rather than a
 * synthetic bold.
 */
const satoshi = localFont({
  src: './fonts/Satoshi-Variable.woff2',
  variable: '--font-satoshi',
  weight: '300 900',
  display: 'swap',
  preload: true,
  adjustFontFallback: 'Arial',
});

const jetbrains = localFont({
  src: './fonts/JetBrainsMono-Variable.woff2',
  variable: '--font-jetbrains',
  weight: '100 800',
  display: 'swap',
  preload: true,
  adjustFontFallback: 'Arial',
});

const site = getSite();
const profile = getProfile();
const sections = getSections();

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: `%s — ${profile.name}` },
  description: site.description,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'profile',
    siteName: profile.name,
    title: site.title,
    description: site.description,
    url: site.url,
    locale: site.locale,
  },
  twitter: {
    card: 'summary_large_image',
    title: site.title,
    description: site.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#0D0A0B',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const jsonLd = [
    buildPersonJsonLd(profile, site),
    buildWebSiteJsonLd(site),
    ...buildProjectsJsonLd(getFlagshipProjects(), profile),
  ];

  // suppressHydrationWarning below covers ONE thing: the inline script in <body>
  // sets data-js on <html> before React hydrates, so the client element carries
  // an attribute the server HTML did not. That is the intended behaviour of a
  // pre-hydration script, not a bug, and React cannot tell the difference.
  // The suppression applies to this element's own attributes only — never to its
  // descendants — so genuine mismatches deeper in the tree are still reported.
  return (
    <html
      lang={site.locale}
      className={`${satoshi.variable} ${jetbrains.variable}`}
      suppressHydrationWarning
    >
      <body>
        {/*
          Runs before body content paints, so scroll-reveal's hidden state is
          only ever applied when JS is actually present. Without this gate a
          script failure would leave every revealed element permanently
          invisible — the content is in the HTML and must stay readable when
          nothing is there to reveal it.
        */}
        <script
          dangerouslySetInnerHTML={{ __html: `document.documentElement.dataset.js='true'` }}
        />

        <SkipLink />

        {/* Without JS the overlay can never resolve, so it must not exist. */}
        <noscript>
          <style>{`#loading{display:none!important}`}</style>
        </noscript>

        <LoadingScreen />

        <Navigation sections={sections} name={profile.name} resumeHref={profile.resumeHref} />

        <main id="main" tabIndex={-1}>
          {children}
        </main>

        <Footer />

        <Grain />

        <script
          type="application/ld+json"
          // Derived from typed content, so the payload is ours, not user input.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
