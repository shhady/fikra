import test from 'node:test';
import assert from 'node:assert/strict';

import { REQUIRED_CONTACT_FIELDS, validateContactValues } from '../lib/contactFields.mjs';

test('service is a required field — the server has always required it', () => {
  assert.ok(REQUIRED_CONTACT_FIELDS.includes('service'));
  assert.deepEqual([...REQUIRED_CONTACT_FIELDS].sort(), ['email', 'message', 'name', 'service']);
});

test('a submission missing service is rejected', () => {
  const errors = validateContactValues({
    name: 'Test',
    email: 'a@b.com',
    service: '',
    message: 'Hello',
  });

  assert.deepEqual(errors, ['service']);
});

test('a complete submission is accepted', () => {
  const errors = validateContactValues({
    name: 'Test',
    email: 'a@b.com',
    service: 'Website build',
    message: 'Hello',
  });

  assert.deepEqual(errors, []);
});

test('a malformed email is rejected', () => {
  const errors = validateContactValues({
    name: 'Test',
    email: 'not-an-email',
    service: 'Website build',
    message: 'Hello',
  });

  assert.deepEqual(errors, ['email']);
});

test('whitespace does not satisfy a required field', () => {
  const errors = validateContactValues({
    name: '   ',
    email: 'a@b.com',
    service: 'Website build',
    message: '   ',
  });

  assert.deepEqual(errors.sort(), ['message', 'name']);
});
