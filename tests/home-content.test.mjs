import test from 'node:test';
import assert from 'node:assert/strict';

import { HOME } from '../lib/content/home.js';

const LOCALES = ['en', 'ar', 'he'];

test('all three locales exist and share the same shape', () => {
  for (const locale of LOCALES) {
    const c = HOME[locale];
    assert.ok(c, `missing locale: ${locale}`);
    assert.deepEqual(
      Object.keys(c).sort(),
      ['cta', 'hero', 'industries', 'languages', 'meta', 'services', 'work'].sort(),
      `locale ${locale} has the wrong top-level keys`
    );
  }
});

test('the proof grid is gone — its counters were unverifiable', () => {
  for (const locale of LOCALES) {
    assert.equal(HOME[locale].proof, undefined, `${locale} still has a proof section`);
  }
});

test('no unverifiable claim survives, in any script', () => {
  // "17 systems" and "8 industries" were invented; "one codebase" is not
  // something a visitor can check by switching language.
  const forbidden = [/\b17\b/, /١٧/, /one codebase/i, /منظومة واحدة/, /בסיס קוד אחד/];

  for (const locale of LOCALES) {
    const json = JSON.stringify(HOME[locale]);
    for (const pattern of forbidden) {
      assert.ok(!pattern.test(json), `${locale} still contains ${pattern}`);
    }
  }
});

test('exactly six offerings, in every locale', () => {
  for (const locale of LOCALES) {
    assert.equal(HOME[locale].services.items.length, 6, `${locale} does not have 6 offerings`);
  }
});

test('the three previously-invisible offerings are present in English', () => {
  const titles = HOME.en.services.items.map((item) => item.title);
  assert.ok(titles.some((t) => /RAG/i.test(t)), 'RAG assistants missing');
  assert.ok(titles.some((t) => /Marketing/i.test(t)), 'Marketing systems missing');
  assert.ok(titles.some((t) => /Visual/i.test(t)), 'Visual content missing');
});

test('the hero does not lead with a restaurant signal', () => {
  // "Online ordering" was the single strongest food-service cue in the hero.
  assert.ok(
    !HOME.en.hero.capabilities.some((c) => /online ordering/i.test(c)),
    'the Online ordering chip is still in the hero'
  );
});

test('restaurants is not the first industry, in any locale', () => {
  const first = { en: /restaurant/i, ar: /مطاعم/, he: /מסעדות/ };

  for (const locale of LOCALES) {
    assert.ok(
      !first[locale].test(HOME[locale].industries.items[0]),
      `${locale} still leads its industry list with restaurants`
    );
  }
});

test('all 8 industries are retained', () => {
  for (const locale of LOCALES) {
    assert.equal(HOME[locale].industries.items.length, 8);
  }
});

test('the meta description no longer leads with online ordering', () => {
  assert.ok(!/online ordering/i.test(HOME.en.meta.description));
  assert.match(HOME.en.meta.description, /AI/);
});
