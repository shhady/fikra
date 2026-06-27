import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import {
  DEFAULT_CONTACT_EMAIL_RECIPIENT,
  buildContactMailOptions,
  getContactEmailRecipient,
} from '../lib/contactEmail.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

test('contact email is addressed only to MY_EMAIL with sender reply-to', () => {
  const originalMyEmail = process.env.MY_EMAIL;
  process.env.MY_EMAIL = 'owner@example.com';

  const options = buildContactMailOptions({
    name: 'Test Sender',
    email: 'visitor@example.com',
    phone: '0501234567',
    service: 'Website build',
    message: 'I want to start a project.',
  });

  assert.equal(DEFAULT_CONTACT_EMAIL_RECIPIENT, 'shhadyse@gmail.com');
  assert.equal(getContactEmailRecipient(), 'owner@example.com');
  assert.equal(options.to, 'owner@example.com');
  assert.deepEqual(options.replyTo, {
    name: 'Test Sender',
    address: 'visitor@example.com',
  });
  assert.match(options.subject, /Test Sender/);
  assert.match(options.text, /Website build/);
  assert.match(options.html, /I want to start a project\./);

  if (originalMyEmail === undefined) {
    delete process.env.MY_EMAIL;
  } else {
    process.env.MY_EMAIL = originalMyEmail;
  }
});

test('contact email falls back to the requested inbox when MY_EMAIL is missing', () => {
  const originalMyEmail = process.env.MY_EMAIL;
  delete process.env.MY_EMAIL;

  const options = buildContactMailOptions({
    name: 'Test Sender',
    email: 'visitor@example.com',
    service: 'Website build',
    message: 'I want to start a project.',
  });

  assert.equal(options.to, 'shhadyse@gmail.com');

  if (originalMyEmail === undefined) {
    delete process.env.MY_EMAIL;
  } else {
    process.env.MY_EMAIL = originalMyEmail;
  }
});

test('contact email escapes submitted HTML before rendering', () => {
  const options = buildContactMailOptions({
    name: '<img src=x onerror=alert(1)>',
    email: 'visitor@example.com',
    service: '<script>alert(1)</script>',
    message: 'Hello <b>there</b>',
  });

  assert.doesNotMatch(options.html, /<script>/);
  assert.doesNotMatch(options.html, /<b>there<\/b>/);
  assert.match(options.html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.match(options.html, /Hello &lt;b&gt;there&lt;\/b&gt;/);
});

test('contact route does not import database or lead storage integrations', async () => {
  const routePath = path.join(repoRoot, 'app', 'api', 'contact', 'route.js');
  const routeSource = await readFile(routePath, 'utf8');

  assert.doesNotMatch(routeSource, /connectDB/);
  assert.doesNotMatch(routeSource, /models\/Contact/);
  assert.doesNotMatch(routeSource, /addLeadToGoogleSheets/);
  assert.match(routeSource, /sendContactEmail/);
});
