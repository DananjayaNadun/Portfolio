import { projectSchema, type Project } from './schema';

/**
 * PLACEHOLDER CONTENT — awaiting docs/01-PRD.md §18.
 *
 * The shape is final. Each entry is written at roughly the length real content
 * should be, so replacing the strings requires no layout change: an outcome
 * that fits on two lines here will fit on two lines with your numbers in it.
 *
 * The schema refuses a project without an `outcome`, which is the one editorial
 * rule worth enforcing in types — "built with React and Node" is not a project
 * description, it is a stack list.
 */
export const projects: Project[] = [
  {
    slug: 'realtime-collaboration',
    title: 'Real-time collaboration engine',
    tagline: 'Multiplayer editing for documents with thousands of concurrent authors.',
    outcome:
      'Cut p95 edit latency from 800ms to 120ms and removed the last single point of contention in the write path.',
    problem:
      'Every write acquired a document-scoped lock, so one slow client stalled the entire room. Throughput was fine; tail latency was not.',
    role: 'Lead engineer',
    timeframe: '2024',
    stack: ['TypeScript', 'Rust', 'WebSockets', 'PostgreSQL'],
    tier: 'flagship',
  },
  {
    slug: 'design-system',
    title: 'Design system and component platform',
    tagline: 'One component library adopted by six product teams.',
    outcome:
      'Reduced time-to-first-screen for a new product surface from three weeks to four days, and moved accessibility from a review step to a default.',
    problem:
      'Four teams had independently built four button components with four different focus behaviours, none of which met contrast requirements.',
    role: 'Design engineer',
    timeframe: '2023 — 2024',
    stack: ['TypeScript', 'React', 'CSS', 'Storybook'],
    tier: 'flagship',
  },
  {
    slug: 'edge-image-pipeline',
    title: 'Edge image pipeline',
    tagline: 'On-demand transforms at the CDN edge.',
    outcome: 'Cut median image payload by 62% with no visible quality change.',
    problem: 'Origin-rendered images dominated LCP on every marketing page.',
    role: 'Engineer',
    timeframe: '2023',
    stack: ['Rust', 'WebAssembly', 'Cloudflare Workers'],
    tier: 'selected',
  },
  {
    slug: 'observability-dashboard',
    title: 'Observability dashboard',
    tagline: 'Incident triage for a platform team of forty.',
    outcome: 'Reduced mean time to acknowledge from 14 minutes to under 4.',
    problem: 'Alerts arrived without the context needed to judge severity.',
    role: 'Engineer',
    timeframe: '2022',
    stack: ['TypeScript', 'React', 'ClickHouse'],
    tier: 'selected',
  },
  {
    slug: 'schema-migration-tool',
    title: 'Zero-downtime migration tool',
    tagline: 'Online schema changes for a 4TB primary database.',
    outcome: 'Ran 40 production migrations with no maintenance window.',
    problem: 'Every schema change required a scheduled outage.',
    role: 'Engineer',
    timeframe: '2022',
    stack: ['Go', 'PostgreSQL'],
    tier: 'selected',
  },
].map((project) => projectSchema.parse(project));
