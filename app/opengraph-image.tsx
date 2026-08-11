import { readFileSync } from 'node:fs';
import path from 'node:path';
import { ImageResponse } from 'next/og';
import { getProfile } from '@/lib/content';

export const alt = 'Portfolio';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * The share card is the portrait.
 *
 * Generated once at build time, not per request — a runtime OG endpoint would
 * add a cold start to every unfurl, and nothing here changes between deploys.
 *
 * Read from disk at module scope rather than fetched: the build has no server
 * to fetch from, and a network call here would be a build-time failure waiting
 * to happen. Satori handles JPEG reliably, which is why the source is a JPEG
 * rather than the WebP the site itself serves.
 */
/**
 * A data URI, not a Buffer. Satori's <img> accepts a URL or a data URI string
 * and hands anything else to a DataView, which fails with a message that names
 * neither the image nor the tag.
 */
const portrait = `data:image/jpeg;base64,${readFileSync(
  path.join(process.cwd(), 'public/og/portrait.jpg')
).toString('base64')}`;

/**
 * Static-weight TTFs, not the variable woff2 the site ships. Two constraints
 * from Satori, both discovered by build failure rather than documentation:
 *
 *  - woff2 is rejected outright ("Unsupported OpenType signature wOF2").
 *  - the VARIABLE ttf crashes its font parser, so named instances are required.
 *
 * Read at build time only; neither file is ever served to a browser.
 */
const satoshiMedium = readFileSync(path.join(process.cwd(), 'app/fonts/Satoshi-OG-500.ttf'));
const satoshiBold = readFileSync(path.join(process.cwd(), 'app/fonts/Satoshi-OG-700.ttf'));

export default async function OpengraphImage() {
  const profile = getProfile();

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: '#0D0A0B',
          color: '#EFECED',
          fontFamily: 'Satoshi',
          position: 'relative',
        }}
      >
        {/* The crimson key, sampled from the footage. */}
        {/* Explicit top/left/width/height, not `inset: 0`. Satori silently drops
            the shorthand, which renders the element at zero size — the failure
            mode is an overlay that simply never appears, with no error. */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            backgroundImage:
              // Centred on the seam, not behind the portrait, so the glow spills
              // onto the type side and reads as one lit room rather than two panels.
              'radial-gradient(ellipse 55% 75% at 62% 55%, #49081C 0%, transparent 72%)',
            display: 'flex',
          }}
        />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '72px',
            flex: 1,
          }}
        >
          <div
            style={{
              fontSize: 22,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: '#887C80',
              display: 'flex',
            }}
          >
            {profile.role}
          </div>

          <div
            style={{
              fontSize: 84,
              fontWeight: 700,
              letterSpacing: '-0.035em',
              lineHeight: 1.02,
              marginTop: 22,
              display: 'flex',
            }}
          >
            {profile.name}
          </div>

          <div
            style={{
              fontSize: 30,
              lineHeight: 1.4,
              color: '#A29A9D',
              marginTop: 24,
              maxWidth: 520,
              display: 'flex',
            }}
          >
            {profile.positioning}
          </div>
        </div>

        <div style={{ display: 'flex', width: 430, position: 'relative' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={portrait}
            alt=""
            width={430}
            height={630}
            style={{ objectFit: 'cover', width: 430, height: 630 }}
          />
          {/* Feathers the portrait into the field so it reads as one image,
              not a photo pasted onto a panel. */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 430,
              height: 630,
              display: 'flex',
              // A long feather so the panel edge stops reading as a seam.
              backgroundImage:
                'linear-gradient(90deg, #0D0A0B 0%, rgba(13,10,11,0.6) 34%, transparent 68%)',
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Satoshi', data: satoshiMedium, style: 'normal', weight: 500 },
        { name: 'Satoshi', data: satoshiBold, style: 'normal', weight: 700 },
      ],
    }
  );
}
