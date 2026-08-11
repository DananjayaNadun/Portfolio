/**
 * The content accessor layer.
 *
 * Components import from here and never from `content/` directly. That single
 * indirection is the whole CMS-migration story (docs/01-PRD.md §16): swapping
 * the source to MDX or a headless CMS changes this file only, because the
 * return types are the contract rather than the module paths.
 */

import { profile } from '@/content/profile';
import { projects } from '@/content/projects';
import { skillGroups } from '@/content/skills';
import { trajectoryEntries } from '@/content/trajectory';
import { sections, site, type SectionId } from '@/content/site';
import type { Profile, Project, Site, SkillGroup, TrajectoryEntry } from '@/content/schema';

export function getProfile(): Profile {
  return profile;
}

export function getSite(): Site {
  return site;
}

export function getSections(): typeof sections {
  return sections;
}

export function getSectionIds(): readonly SectionId[] {
  return sections.map((section) => section.id);
}

export function getProjects(): readonly Project[] {
  return projects;
}

/** Ranked, not gridded. Flagships get case-study space; the rest are a list. */
export function getFlagshipProjects(): readonly Project[] {
  return projects.filter((project) => project.tier === 'flagship');
}

export function getSelectedProjects(): readonly Project[] {
  return projects.filter((project) => project.tier === 'selected');
}

export function getSkillGroups(): readonly SkillGroup[] {
  return skillGroups;
}

/** Newest first — the order the list is authored in. */
export function getTrajectory(): readonly TrajectoryEntry[] {
  return trajectoryEntries;
}

export function getCertificates(): readonly TrajectoryEntry[] {
  return trajectoryEntries.filter((entry) => entry.kind === 'certificate');
}

export type { Profile, Project, Site, SkillGroup, TrajectoryEntry, SectionId };
