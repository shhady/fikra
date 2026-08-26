import test from 'node:test';
import assert from 'node:assert/strict';

import { PROJECTS } from '../lib/content/projects.js';
import { CASE_STUDIES } from '../lib/content/caseStudies.js';

const LOCALES = ['en', 'ar', 'he'];
const CURRENT_ADDITIONS = new Map([
  ['andlee-energy', 'https://andlee-energy.com/'],
  ['badran-engineers', 'https://www.badran.co.il/'],
  ['landmap', 'https://www.landmap-ltd.com/'],
  ['level-up-elevators', 'https://www.luelevator.com/'],
]);
const REMOVED_PROJECTS = ['keysmatch', 'stella', 'brokers'];

/**
 * The link contract (lib/content/projects.js): a project has either a live
 * `url` (external) or a `slug` (internal case-study page). The projects page
 * branches on it; an entry with neither renders a dead card.
 */

test('every project has a url or a slug — never neither', () => {
  for (const project of PROJECTS) {
    assert.ok(
      project.url || project.slug,
      `${project.id} has neither url nor slug — it would render a dead card`
    );
  }
});

test('the projects roster contains the four current additions and omits retired entries', () => {
  const byId = new Map(PROJECTS.map((project) => [project.id, project]));

  for (const [id, url] of CURRENT_ADDITIONS) {
    assert.equal(byId.get(id)?.url, url, `${id} is missing or points to the wrong site`);
  }

  for (const id of REMOVED_PROJECTS) {
    assert.ok(!byId.has(id), `${id} should no longer appear in the projects roster`);
  }
});

test('external projects have the logo their card renders', () => {
  for (const project of PROJECTS.filter((p) => p.url)) {
    assert.ok(project.image, `${project.id} has a url but no image — next/image would throw`);
  }
});

test('every slug has a case study, in every locale', () => {
  for (const project of PROJECTS.filter((p) => p.slug)) {
    const entry = CASE_STUDIES[project.slug];
    assert.ok(entry, `${project.slug} has no case study — its card links to a 404`);
    for (const locale of LOCALES) {
      assert.ok(entry[locale], `${project.slug} is missing the ${locale} case study`);
    }
  }
});

test('case-study locales are structurally identical', () => {
  for (const [slug, entry] of Object.entries(CASE_STUDIES)) {
    const shape = (c) =>
      JSON.stringify({
        keys: Object.keys(c).sort(),
        steps: c.steps.length,
        modules: c.modules.map((m) => m.features.length),
      });

    const reference = shape(entry.en);
    for (const locale of LOCALES) {
      assert.equal(
        shape(entry[locale]),
        reference,
        `${slug}: ${locale} case study differs in structure from en — a missing key crashes only that locale`
      );
    }
  }
});

test('an unlaunched product is never featured on the homepage', () => {
  for (const project of PROJECTS.filter((p) => p.status === 'in-development')) {
    assert.ok(!project.featured, `${project.id} is in development but featured on the homepage`);
    assert.ok(!project.url, `${project.id} is in development but claims a live url`);
  }
});
