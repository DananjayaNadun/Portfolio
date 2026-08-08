import { profileSchema, type Profile } from './schema';

/**
 * PLACEHOLDER CONTENT.
 *
 * Every string below is a stand-in awaiting the content inventory in
 * docs/01-PRD.md §18. The shape is final, so replacing the values requires no
 * layout change anywhere.
 *
 * Lengths are chosen to sit near the middle of what the layout tolerates, so
 * real content of a similar size drops in without resetting the composition.
 */
export const profile: Profile = profileSchema.parse({
  name: 'Your Name',
  role: 'Software Engineer',
  positioning: 'I build interfaces that hold up under load.',
  location: 'Remote',
  availability: 'available',
  availabilityLabel: 'Available for work',
  email: 'hello@example.com',
  resumeHref: '/resume.pdf',
  about: [
    'Placeholder. Two or three short paragraphs go here — what you build, why you build it, and the kind of problem you go looking for. Written in the first person, specific rather than general.',
    'The second paragraph earns the eye contact the hero just established. It should sound like a person talking, not a profile summary.',
  ],
  knowsAbout: ['TypeScript', 'React', 'Next.js', 'Performance', 'Accessibility'],
  socials: [
    { label: 'GitHub', href: 'https://github.com/', visible: true },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/', visible: true },
  ],
});
