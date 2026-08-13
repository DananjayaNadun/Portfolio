import { describe, expect, it } from 'vitest';
import {
  getFlagshipProjects,
  getProfile,
  getProjects,
  getSections,
  getSite,
  getSkillGroups,
  getTrajectory,
} from '@/lib/content';
import { profileSchema, projectSchema } from '@/content/schema';

/**
 * These assert the editorial rules from docs/01-PRD.md §9, not just that Zod
 * ran. A schema guarantees a field is a string; it cannot guarantee the string
 * is a claim worth making, and those are the rules that quietly rot as content
 * gets edited.
 */

describe('content parses', () => {
  it('every module parses at import time', () => {
    expect(getProfile().name).toBeTruthy();
    expect(getSite().url).toMatch(/^https?:\/\//);
    expect(getProjects().length).toBeGreaterThan(0);
    expect(getSkillGroups().length).toBeGreaterThan(0);
    expect(getTrajectory().length).toBeGreaterThan(0);
  });
});

describe('editorial rules', () => {
  it('every project states an outcome', () => {
    for (const project of getProjects()) {
      expect(project.outcome.length, `${project.slug} has no outcome`).toBeGreaterThan(20);
    }
  });

  it('rejects a project with no outcome', () => {
    const invalid = { ...getProjects()[0], outcome: '' };
    expect(() => projectSchema.parse(invalid)).toThrow();
  });

  it('has at least one flagship, or Work has nothing to lead with', () => {
    expect(getFlagshipProjects().length).toBeGreaterThan(0);
  });

  it('states no skill as a percentage', () => {
    // "React — 85%" is unfalsifiable and reads as junior (PRD §9).
    for (const group of getSkillGroups()) {
      for (const item of group.items) {
        expect(item, `${item} looks like a percentage`).not.toMatch(/\d+\s*%/);
      }
    }
  });

  it('keeps the positioning line short enough to read at display size', () => {
    expect(getProfile().positioning.length).toBeLessThanOrEqual(120);
  });

  it('caps role achievements at three', () => {
    for (const entry of getTrajectory()) {
      expect(entry.achievements.length, `${entry.organisation}`).toBeLessThanOrEqual(3);
    }
  });

  it('rejects an over-long positioning line', () => {
    expect(() => profileSchema.parse({ ...getProfile(), positioning: 'x'.repeat(200) })).toThrow();
  });
});

describe('navigation contract', () => {
  it('numbers sections continuously, starting after the hero', () => {
    // The hero is 01. A duplicate or gap here means two sections claim the same
    // position in the reading order, which happened once already.
    const indices = getSections().map((section) => Number(section.index));
    expect(indices).toEqual([2, 3, 4, 5, 6]);
  });

  it('uses unique, anchor-safe ids', () => {
    const ids = getSections().map((section) => section.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z][a-z0-9-]*$/);
  });

  it('derives the site title from the profile so it cannot drift', () => {
    const profile = getProfile();
    expect(getSite().title).toContain(profile.name);
    expect(getSite().title).toContain(profile.role);
  });
});

describe('trajectory dates', () => {
  it('uses a machine-parseable format for every date', () => {
    for (const entry of getTrajectory()) {
      expect(entry.start).toMatch(/^\d{4}(\.\d{2})?$/);
      expect(entry.end === 'present' || /^\d{4}(\.\d{2})?$/.test(entry.end)).toBe(true);
    }
  });

  it('never ends before it starts', () => {
    for (const entry of getTrajectory()) {
      if (entry.end === 'present') continue;
      expect(Number(entry.end.replace('.', '')), `${entry.organisation}`).toBeGreaterThanOrEqual(
        Number(entry.start.replace('.', ''))
      );
    }
  });
});
