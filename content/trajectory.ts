import { trajectoryEntrySchema, type TrajectoryEntry } from './schema';

/**
 * PLACEHOLDER CONTENT — awaiting docs/01-PRD.md §18.
 *
 * One list for what the brief split across Journey, Experience, Timeline and
 * Certificates (see docs/01-PRD.md §8.1). Certificates sit on the same spine as
 * roles because a certification genuinely is a dated event — putting them in a
 * detached grid of badges states the opposite.
 *
 * Newest first. Achievements are capped at three by the schema: a role with
 * seven bullets has none that matter.
 */
export const trajectory: TrajectoryEntry[] = [
  {
    kind: 'role',
    organisation: 'Northwind Systems',
    title: 'Senior Frontend Engineer',
    start: '2023.04',
    end: 'present',
    location: 'Remote',
    achievements: [
      'Led the rebuild of the collaborative editor, cutting p95 edit latency from 800ms to 120ms.',
      'Introduced the design system now used by six product teams.',
      'Mentored three engineers through their first production launches.',
    ],
  },
  {
    kind: 'certificate',
    organisation: 'Amazon Web Services',
    title: 'Solutions Architect — Associate',
    start: '2024.11',
    end: '2024.11',
    credentialId: 'SAA-C03',
    achievements: [],
  },
  {
    kind: 'role',
    organisation: 'Lumen Labs',
    title: 'Frontend Engineer',
    start: '2021.02',
    end: '2023.03',
    location: 'Berlin',
    achievements: [
      'Shipped the edge image pipeline that cut median image payload by 62%.',
      'Owned Core Web Vitals across eight marketing surfaces.',
    ],
  },
  {
    kind: 'role',
    organisation: 'Fieldwork Studio',
    title: 'Developer',
    start: '2019.09',
    end: '2021.01',
    location: 'Berlin',
    achievements: ['Built and maintained twelve client sites on a shared component base.'],
  },
  {
    kind: 'education',
    organisation: 'Technical University',
    title: 'BSc Computer Science',
    start: '2016',
    end: '2019',
    achievements: [],
  },
];

export const trajectoryEntries: TrajectoryEntry[] = trajectory.map((entry) =>
  trajectoryEntrySchema.parse(entry)
);
