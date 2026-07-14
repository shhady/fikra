import test from 'node:test';
import assert from 'node:assert/strict';

import { en } from '../translations/en.js';
import { ar } from '../translations/ar.js';
import { he } from '../translations/he.js';

import { REQUIRED_CONTACT_FIELDS } from '../lib/contactFields.mjs';

const LOCALES = { en, ar, he };

/**
 * The contact form used to surface the field LABEL as its validation error, so
 * a malformed address produced an error that read "Email Address" — which tells
 * the visitor nothing about what is wrong. These tests make that regression
 * impossible: every required field needs a real message, in every language, and
 * that message must not be the label.
 */

test('every required field has a validation message, in every locale', () => {
  for (const [name, t] of Object.entries(LOCALES)) {
    for (const field of REQUIRED_CONTACT_FIELDS) {
      const message = t.contact.form.errors?.[field];
      assert.ok(
        typeof message === 'string' && message.trim(),
        `${name}: contact.form.errors.${field} is missing`
      );
    }
  }
});

test('a validation message is never just the field label', () => {
  for (const [name, t] of Object.entries(LOCALES)) {
    for (const field of REQUIRED_CONTACT_FIELDS) {
      assert.notEqual(
        t.contact.form.errors[field],
        t.contact.form[field],
        `${name}: contact.form.errors.${field} is the label, not an error message`
      );
    }
  }
});

test('validation messages are localised, not copied across languages', () => {
  // The old form hardcoded Arabic error strings and showed them to English and
  // Hebrew visitors too.
  for (const field of REQUIRED_CONTACT_FIELDS) {
    const seen = new Set([en, ar, he].map((t) => t.contact.form.errors[field]));
    assert.equal(seen.size, 3, `the ${field} error message is not distinct in all three languages`);
  }
});
