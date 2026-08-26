import test from 'node:test';
import assert from 'node:assert/strict';

import { PROJECTS, getFeaturedProjects } from '../lib/content/projects.js';

test('the selected five launched projects are featured', () => {
  const featuredIds = PROJECTS.filter((p) => p.featured).map((p) => p.id).sort();
  assert.deepEqual(featuredIds, ['bclick', 'cicilia', 'eventy', 'rojeh', 'watermelon'].sort());
});

test('every featured project has both a URL and a logo — the card renders both', () => {
  for (const project of PROJECTS.filter((p) => p.featured)) {
    assert.ok(project.url, `${project.id} is featured but has no url`);
    assert.ok(project.image, `${project.id} is featured but has no image`);
  }
});

test('getFeaturedProjects returns localised, featured-only entries', () => {
  const featured = getFeaturedProjects('ar');
  assert.equal(featured.length, 5);
  assert.ok(featured.every((p) => typeof p.description === 'string'));
});
