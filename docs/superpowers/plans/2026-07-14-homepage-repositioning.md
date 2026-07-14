# Homepage Repositioning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reposition the FikraNova homepage from a food-service-biased "business systems" page to an AI solutions and software studio, remove unverifiable proof, migrate four dead design tokens, and fix the contact-form contract mismatch that the homepage CTA funnels into.

**Architecture:** Content lives in `lib/content/home.js` (server-only, three locales in one file); the homepage component `app/[lang]/page.js` renders it. No new components. The dead tokens (`paper`, `carbon`, `rail`, `perf`) are residue of an earlier print-metaphor design system and are migrated to the live `ink/surface/chalk/steel/gold` system. The contact fix is a shared field contract (`lib/contactFields.mjs`) imported by both the client form and the server mailer, so the two cannot drift again.

**Tech Stack:** Next.js 16 (App Router, Turbopack), Tailwind v3.4, Node's built-in `node:test` runner (`.mjs`, no framework).

**Spec:** `docs/superpowers/specs/2026-07-14-homepage-repositioning-design.md`

---

## Ground truth (verified, do not re-derive)

- Project assets are **LOGOS, not screenshots** — stated in a comment at `app/[lang]/projects/page.js:63`. No copy may call them screenshots.
- **Live URL health**, all 8 checked with redirects followed:
  - Healthy (200): Eventy, BClick (→`www.bclick.co`), Cicilia, Watermelon Tours (→`/en/landing`), Rojeh Naddaf (→`www.`)
  - **Broken:** KeysMatch (504 ×3), Stella (404), BrokerAffiliate (TLS handshake failure)
- **Dead tokens, exact locations:**
  - `bg-paper` + `text-carbon`: `components/Header.js:73`, `components/Header.js:118`, `app/[lang]/layout.js:118`, `app/[lang]/error.js:44`
  - `text-rail`: `app/[lang]/error.js:35`
  - `.perf`: `app/[lang]/error.js:39`, `app/[lang]/not-found.js:28`, `components/Footer.js:89`
- `lib/contactEmail.mjs:5` requires `['name','email','service','message']`; `ContactForm.jsx:32-43` validates only name/email/message.
- `t.contact.form.service` **already exists** in all three translation files (e.g. `translations/ar.js:329`). No new copy needed for the fix.

## File structure

| File | Responsibility | Action |
|---|---|---|
| `tests/design-tokens.test.mjs` | Guards that no dead token is reachable and `.perf` is defined | Create |
| `tests/contact-fields.test.mjs` | Guards client/server field-contract parity | Create |
| `tests/home-content.test.mjs` | Guards positioning: no unverifiable counters, six offerings, locale parity | Create |
| `tests/projects-featured.test.mjs` | Guards that only healthy-URL projects are featured | Create |
| `lib/contactFields.mjs` | **Single source of truth** for required contact fields + pure validator | Create |
| `lib/contactEmail.mjs` | Imports the shared field list instead of declaring its own | Modify |
| `app/[lang]/contact/ContactForm.jsx` | Imports the shared validator; adds `service` error | Modify |
| `lib/content/home.js` | All homepage copy, 3 locales | Rewrite |
| `lib/content/projects.js` | Adds `featured` flag + `getFeaturedProjects()` | Modify |
| `app/[lang]/page.js` | Renders Selected work + after-launch strip; drops the proof grid | Modify |
| `app/globals.css` | Defines `.perf` | Modify |
| `components/Header.js`, `app/[lang]/layout.js`, `app/[lang]/error.js` | Token migration | Modify |
| `package.json` | Adds a `test` script | Modify |

---

## Task 1: Test harness

There is no `test` script today — only `test:printer-api`. Every later task depends on being able to run tests.

**Files:**
- Modify: `package.json:5-13`

- [ ] **Step 1: Add the test script**

In `package.json`, inside `"scripts"`, add `"test"` immediately after `"lint"`:

```json
    "lint": "next lint",
    "test": "node --test tests/",
    "admin:credentials": "node scripts/generate-admin-credentials.mjs",
```

Node's runner only collects files matching `*.test.mjs` (and similar), so `tests/printer-api.e2e.mjs` is correctly ignored.

- [ ] **Step 2: Verify the existing suite runs**

Run: `npm test`
Expected: PASS — the existing `tests/contactEmail.test.mjs` runs green.

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "chore: add npm test script for the node:test suite"
```

---

## Task 2: Dead-token migration

`bg-paper`, `text-carbon` and `text-rail` emit no CSS — they are undefined. The Header renders on the homepage, so its CTA has broken contrast today.

**Files:**
- Create: `tests/design-tokens.test.mjs`
- Modify: `components/Header.js:73`, `components/Header.js:118`, `app/[lang]/layout.js:118`, `app/[lang]/error.js:35`, `app/[lang]/error.js:44`, `app/globals.css`

- [ ] **Step 1: Write the failing test**

Create `tests/design-tokens.test.mjs`:

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

/**
 * `paper`, `carbon` and `rail` are residue of an earlier print-metaphor design
 * system. They are defined nowhere, so Tailwind emits nothing and the class is a
 * silent no-op — the same failure that hid a broken Header CTA for months.
 * This test makes a reintroduction fail loudly.
 */
const DEAD_TOKENS = /\b(?:bg|text|border|ring|divide|from|to|via)-(?:paper|carbon|rail)\b/;

async function sourceFiles(dir, acc = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.next') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await sourceFiles(full, acc);
    else if (/\.(js|jsx)$/.test(entry.name)) acc.push(full);
  }
  return acc;
}

test('no dead design tokens remain in app/ or components/', async () => {
  const files = [
    ...(await sourceFiles(path.join(repoRoot, 'app'))),
    ...(await sourceFiles(path.join(repoRoot, 'components'))),
  ];

  const offenders = [];
  for (const file of files) {
    const source = await readFile(file, 'utf8');
    if (DEAD_TOKENS.test(source)) offenders.push(path.relative(repoRoot, file));
  }

  assert.deepEqual(offenders, [], `dead tokens still used in: ${offenders.join(', ')}`);
});

test('.perf is defined in globals.css', async () => {
  const css = await readFile(path.join(repoRoot, 'app', 'globals.css'), 'utf8');
  assert.match(css, /^\s*\.perf\s*\{/m, '.perf is used in 3 components but defined nowhere');
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `node --test tests/design-tokens.test.mjs`
Expected: FAIL — both tests. First lists `app/[lang]/layout.js, app/[lang]/error.js, components/Header.js`; second reports `.perf` undefined.

- [ ] **Step 3: Migrate the Header (2 sites)**

`components/Header.js:73` — replace `bg-paper` → `bg-chalk`, `text-carbon` → `text-ink`:

```jsx
            className="rounded bg-chalk px-4 py-2 font-mono text-xs uppercase tracking-[0.12em] text-ink transition-colors hover:bg-white"
```

`components/Header.js:118`:

```jsx
              className="mt-3 block rounded bg-chalk px-4 py-3 text-center font-mono text-xs uppercase tracking-[0.12em] text-ink"
```

- [ ] **Step 4: Migrate the skip link**

`app/[lang]/layout.js:118`:

```jsx
            className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[100] focus:bg-chalk focus:px-4 focus:py-2 focus:text-ink"
```

- [ ] **Step 5: Migrate the error page (2 sites)**

`app/[lang]/error.js:35`:

```jsx
        <p className="eyebrow !text-steel">Error</p>
```

`app/[lang]/error.js:44`:

```jsx
          className="rounded bg-chalk px-5 py-3 font-mono text-[13px] uppercase tracking-[0.12em] text-ink transition-colors hover:bg-white"
```

- [ ] **Step 6: Define `.perf`**

In `app/globals.css`, inside the `@layer components { … }` block, immediately after the `.card:hover` rule (before the closing `}` at line 150):

```css
  /* A perforation line — the tear-off edge of a receipt. Used as a section
     divider in the footer, the error page and 404. It was called for in three
     components but never defined, so it has been rendering as an empty spacer. */
  .perf {
    height: 1px;
    background-image: repeating-linear-gradient(
      to right,
      rgb(var(--hairline)) 0 6px,
      transparent 6px 12px
    );
  }
```

- [ ] **Step 7: Run tests to verify they pass**

Run: `node --test tests/design-tokens.test.mjs`
Expected: PASS — both tests.

- [ ] **Step 8: Confirm the CSS actually emits**

A passing source-scan does not prove Tailwind generated anything — that is exactly how the original bug hid. With the dev server running:

Run: `curl -s "http://localhost:3001/en" | grep -oE '/_next/static/css/[^"]+\.css' | head -1`
Then fetch that stylesheet and confirm `.bg-chalk`, `.text-ink`, `.text-steel` and `.perf` each appear.
Expected: all four present.

- [ ] **Step 9: Commit**

```bash
git add tests/design-tokens.test.mjs components/Header.js "app/[lang]/layout.js" "app/[lang]/error.js" app/globals.css
git commit -m "fix: migrate dead paper/carbon/rail tokens and define .perf

bg-paper, text-carbon and text-rail were defined in neither tailwind.config.js
nor globals.css, so Tailwind emitted nothing and the Header CTA, skip link and
error actions rendered with no background or colour. Migrated to the live
ink/chalk/steel system. .perf was used in 3 components and defined nowhere;
it is now a perforation rule."
```

> **Visual consequence:** `.perf` was invisible and is now a visible dashed rule in the Footer, error page and 404. This is intended (see spec §7) but it is a real visual change — eyeball those three pages.

---

## Task 3: Contact-form field contract

The homepage CTA sends every visitor here. `ContactForm` does not require `service`; `contactEmail.mjs` does. The visitor fills every visible field and gets a generic failure. Fix the *contract*, not the symptom: one shared module, imported by both sides.

**Files:**
- Create: `lib/contactFields.mjs`, `tests/contact-fields.test.mjs`
- Modify: `lib/contactEmail.mjs:5`, `app/[lang]/contact/ContactForm.jsx`

- [ ] **Step 1: Write the failing test**

Create `tests/contact-fields.test.mjs`:

```javascript
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
```

- [ ] **Step 2: Run it and watch it fail**

Run: `node --test tests/contact-fields.test.mjs`
Expected: FAIL — `Cannot find module '../lib/contactFields.mjs'`.

- [ ] **Step 3: Create the shared contract**

Create `lib/contactFields.mjs`:

```javascript
/**
 * The contact-form field contract.
 *
 * This module exists because the client form and the server mailer disagreed:
 * the server required `service`, the client never asked for it, so a visitor
 * could fill every visibly-required field and still get a generic failure.
 *
 * Both sides now import from here. Keep it dependency-free — it is imported
 * into a client component, so it must not reach for nodemailer or any Node API.
 */

export const REQUIRED_CONTACT_FIELDS = ['name', 'email', 'service', 'message'];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * @param {Record<string, string>} values
 * @returns {string[]} names of invalid fields, in REQUIRED_CONTACT_FIELDS order
 */
export function validateContactValues(values) {
  const invalid = [];

  for (const field of REQUIRED_CONTACT_FIELDS) {
    const value = typeof values[field] === 'string' ? values[field].trim() : '';

    if (!value) {
      invalid.push(field);
      continue;
    }

    if (field === 'email' && !EMAIL_PATTERN.test(value)) {
      invalid.push(field);
    }
  }

  return invalid;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/contact-fields.test.mjs`
Expected: PASS — all five.

- [ ] **Step 5: Point the server at the shared contract**

In `lib/contactEmail.mjs`, delete the local declaration on line 5 and import instead. Replace:

```javascript
const REQUIRED_FIELDS = ['name', 'email', 'service', 'message'];
```

with:

```javascript
import { REQUIRED_CONTACT_FIELDS as REQUIRED_FIELDS } from './contactFields.mjs';
```

Move that `import` up beside the existing `import nodemailer from 'nodemailer';` at line 1. Leave every other use of `REQUIRED_FIELDS` untouched — the name is unchanged, so nothing downstream moves.

- [ ] **Step 6: Verify the existing mailer suite still passes**

Run: `node --test tests/contactEmail.test.mjs`
Expected: PASS — unchanged behaviour, single source of truth.

- [ ] **Step 7: Point the client at the shared contract**

In `app/[lang]/contact/ContactForm.jsx`, add the import after line 3:

```jsx
import { validateContactValues } from '@/lib/contactFields.mjs';
```

Replace the whole `validate()` function (lines 32-43) with:

```jsx
  function validate() {
    const next = {};

    // The field list lives in lib/contactFields.mjs, shared with the server
    // mailer. Duplicating it here is what caused `service` to be required by
    // the backend but never asked for by the form.
    for (const field of validateContactValues(values)) {
      next[field] = t.contact.form[field];
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }
```

`t.contact.form.name`, `.email`, `.service` and `.message` all already exist in all three translation files — no new copy is needed.

- [ ] **Step 8: Surface the service error in the UI**

The `service` Field currently passes no `error` prop, so a rejection would be invisible. In `ContactForm.jsx`, change the service Field opening tag:

```jsx
        <Field id="service" label={t.contact.form.service} error={errors.service}>
```

and give its `<select>` the error styling the other inputs use:

```jsx
            className={input(errors.service)}
```

- [ ] **Step 9: Verify in the browser**

With the dev server running, open `/en/contact`. Fill name, email and message; leave the service dropdown on its placeholder. Submit.
Expected: submission is blocked, the service field shows an inline error, and **no** network request is made to `/api/contact`.
Then choose a service and submit.
Expected: succeeds.

- [ ] **Step 10: Commit**

```bash
git add lib/contactFields.mjs lib/contactEmail.mjs "app/[lang]/contact/ContactForm.jsx" tests/contact-fields.test.mjs
git commit -m "fix: share the contact field contract between client and server

contactEmail.mjs required name/email/service/message; ContactForm validated
only name/email/message. A visitor could complete every visibly-required field
and receive a generic failure. Both sides now import the field list and
validator from lib/contactFields.mjs, so they cannot drift again."
```

---

## Task 4: Feature only the projects whose URLs work

Three of eight live URLs are broken. A dead card is worse than a missing one.

**Files:**
- Create: `tests/projects-featured.test.mjs`
- Modify: `lib/content/projects.js`

- [ ] **Step 1: Write the failing test**

Create `tests/projects-featured.test.mjs`:

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';

import { PROJECTS, getFeaturedProjects } from '../lib/content/projects.js';

// Verified 2026-07-14 by fetching each URL with redirects followed:
//   KeysMatch       504 on three consecutive attempts (not a cold start)
//   Stella          404
//   BrokerAffiliate TLS handshake failure — connection refused
const BROKEN = ['keysmatch', 'stella', 'brokers'];

test('no project with a known-broken URL is featured', () => {
  const featuredIds = PROJECTS.filter((p) => p.featured).map((p) => p.id);
  for (const id of BROKEN) {
    assert.ok(!featuredIds.includes(id), `${id} has a broken URL and must not be featured`);
  }
});

test('exactly the five healthy projects are featured', () => {
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
```

- [ ] **Step 2: Run it and watch it fail**

Run: `node --test tests/projects-featured.test.mjs`
Expected: FAIL — `getFeaturedProjects` is not exported; no project has `featured`.

- [ ] **Step 3: Note the ids (already verified — do not rename them)**

The eight ids in `lib/content/projects.js` are, in source order:

`keysmatch` · `eventy` · `bclick` · `cicilia` · `stella` · `watermelon` · `brokers` · `rojeh`

Note the BrokerAffiliate project's id is **`brokers`**, not `brokeraffiliate`. The five to feature are `eventy`, `bclick`, `cicilia`, `watermelon`, `rojeh`.

- [ ] **Step 4: Add the featured flag**

In `lib/content/projects.js`, add `featured: true` to exactly the five healthy entries (Eventy, BClick, Cicilia, Watermelon Tours, Rojeh Naddaf), placed directly after each one's `url` line. For example, in the Eventy entry:

```javascript
    url: 'https://www.eventy.vip',
    featured: true,
```

Do **not** add the flag to KeysMatch, Stella or BrokerAffiliate. Add this comment above the `PROJECTS` array:

```javascript
/**
 * `featured` controls the homepage "Selected work" section only; the /projects
 * page still lists everything.
 *
 * A project is featured only while its live URL actually resolves. As of
 * 2026-07-14, KeysMatch (504), Stella (404) and BrokerAffiliate (TLS failure)
 * do not, so they are listed but not featured. When they are revived, flip the
 * flag back on — no other change is needed.
 */
```

- [ ] **Step 5: Export the selector**

At the bottom of `lib/content/projects.js`, beside the existing `getProjects`, add:

```javascript
/**
 * @param {string} lang
 * @returns {object[]} featured projects, localised, in source order
 */
export function getFeaturedProjects(lang) {
  return getProjects(lang).filter((project) => project.featured);
}
```

`getProjects` (line 129) spreads `...project` before overriding `industry` and `description`, so the new `featured` key is carried through to the returned object automatically. No change to `getProjects` is needed.

- [ ] **Step 6: Run tests to verify they pass**

Run: `node --test tests/projects-featured.test.mjs`
Expected: PASS — all four.

- [ ] **Step 7: Commit**

```bash
git add lib/content/projects.js tests/projects-featured.test.mjs
git commit -m "feat: add featured flag for the homepage work section

Only projects whose live URL resolves are featured. KeysMatch (504), Stella
(404) and BrokerAffiliate (TLS failure) are excluded until revived; a test
enforces it so a dead link cannot reach the homepage."
```

---

## Task 5: Homepage content

Rewrite `lib/content/home.js`. Arabic and Hebrew are **authored, not machine-translated** — the copy below is final, not a starting point.

**Files:**
- Create: `tests/home-content.test.mjs`
- Rewrite: `lib/content/home.js`

- [ ] **Step 1: Write the failing test**

Create `tests/home-content.test.mjs`:

```javascript
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
```

- [ ] **Step 2: Run it and watch it fail**

Run: `node --test tests/home-content.test.mjs`
Expected: FAIL — several. `proof` still exists, `languages`/`work` are missing, `17` is present, `Online ordering` is in the chips, restaurants leads the industries.

- [ ] **Step 3: Rewrite `lib/content/home.js`**

Replace the whole file. Keep the export shape (`HOME` + `getHomeContent`) — `app/[lang]/page.js` imports `getHomeContent`.

```javascript
/**
 * Homepage content, in three languages. Server-only, so all three living in one
 * file costs the visitor nothing.
 *
 * ---------------------------------------------------------------------------
 * On the positioning.
 *
 * FikraNova is an AI solutions and software studio. It is NOT a restaurant
 * agency — but the previous copy read like one. Not in its headline, which sold
 * "business systems" broadly, but in every concrete example a visitor actually
 * met: the hero led with "websites that take orders", the industries list led
 * with restaurants, integrations name-checked "your printer", and the closing
 * CTA opened with "Orders taken by phone during service." Someone who does not
 * run a restaurant read that and self-selected out.
 *
 * Meanwhile three of the six things the studio sells — RAG assistants,
 * marketing systems, visual content — appeared nowhere on the page.
 *
 * Restaurants remain one of eight industries. They are not the identity.
 *
 * On proof: this page used to claim "17 systems delivered" and "8 industries".
 * Nobody could check either, which makes them a liability rather than a proof.
 * They are gone. The proof is now the work itself — five systems that are live,
 * linked, and clickable — plus a language claim a visitor verifies by switching
 * locale and watching the layout flip to RTL. Do not reintroduce a counter
 * unless a visitor can verify it.
 * ---------------------------------------------------------------------------
 */

export const HOME = {
  en: {
    meta: {
      title: 'FikraNova — AI solutions and software for business',
      description:
        'An AI solutions and software studio: websites and platforms, AI agents, RAG assistants, automation, marketing systems and visual content — in Arabic, Hebrew and English.',
    },

    hero: {
      // Deliberately does not repeat "AI" — the headline says it one line later.
      eyebrow: 'Software studio · Nazareth',
      headingLead: 'AI solutions and software, built to',
      headingAccent: 'sell, automate and operate.',
      lede: 'We design and build the software a business actually runs on — websites and platforms, AI agents, assistants that answer from your own documents, automations that chase the work, marketing systems, and the visuals to feed them. In Arabic, Hebrew and English.',
      primary: 'Start a project',
      secondary: 'See our work',
      capabilities: [
        'Multilingual websites',
        'AI agents',
        'RAG assistants',
        'Automation',
        'Marketing systems',
        'Visual content',
        'E-commerce',
        'Booking platforms',
        'B2B portals',
        'Dashboards',
        'Payments',
        'Custom software',
      ],
    },

    services: {
      eyebrow: 'What we do',
      heading: 'Not features. Outcomes.',
      lede: 'Every engagement starts from something that is costing you money or time, and ends with a system that runs without you watching it.',
      items: [
        {
          title: 'Websites & platforms',
          body: 'Multilingual websites and web apps that do real work: take orders, manage stock, hold customer accounts, process payments — plus the dashboard that tells you what actually happened today. Built so your staff run them, not us.',
        },
        {
          title: 'AI agents',
          body: 'Assistants pointed at one specific job: qualify a lead, answer a customer, analyse a call, draft the reply. Measured on whether they do it.',
        },
        {
          title: 'RAG assistants',
          body: 'Answers drawn from your own documents — contracts, catalogues, policies, past tickets — with the source attached, so staff and customers can check the work.',
        },
        {
          title: 'Automation & integrations',
          body: 'The follow-ups, confirmations and hand-offs that get forgotten when people are busy — and the plumbing between your site, your calendar, your CRM and your accountant. This is where most projects quietly break, and it is most of the work.',
        },
        {
          title: 'Marketing systems',
          body: 'Landing pages, lead capture, campaigns, and the follow-up that turns them into conversations. Built to be measured, not admired.',
        },
        {
          title: 'Visual content',
          body: 'Product imagery, ads, social and video — generated and art-directed, in the three languages your customers actually read.',
        },
      ],
      afterLaunch:
        'After launch: monitoring, backups, fixes, small changes — and someone who answers when something stops.',
      afterLaunchLink: 'Support',
    },

    work: {
      eyebrow: 'Selected work',
      heading: 'Systems that are live right now',
      lede: 'Each of these is running in production, in the language its customers actually read. Click through and check.',
      cta: 'See all work',
    },

    industries: {
      eyebrow: 'Who we build for',
      heading: 'We learn the business before we write the software',
      lede: 'An estate agent chasing a viewing and a wholesaler pricing a pallet have nothing in common — except that both are losing money to admin.',
      items: [
        'Real estate',
        'Events & weddings',
        'E-commerce & retail',
        'Restaurants & food',
        'Wholesale & B2B',
        'Tourism & booking',
        'Health & wellness',
        'Professional services',
      ],
    },

    languages: {
      heading: 'Arabic · Hebrew · English',
      body: 'Designed for native RTL and LTR experiences — right-to-left layout, correct letter shaping, bidirectional text. Designed in three scripts, not translated into them.',
    },

    cta: {
      heading: 'Tell us what is breaking',
      lede: 'Leads going cold because nobody followed up. A price list that lives in someone’s head. Bookings taken by phone, twice. Start there — the technology is our problem, not yours.',
      primary: 'Start a project',
      secondary: 'See our work',
    },
  },

  ar: {
    meta: {
      title: 'فكرة نوفا — حلول ذكاء اصطناعي وبرمجيات للأعمال',
      description:
        'استوديو حلول ذكاء اصطناعي وبرمجيات: مواقع ومنصات، وكلاء ذكاء اصطناعي، مساعدون يجيبون من مستنداتك، أتمتة، أنظمة تسويق ومحتوى بصري — بالعربية والعبرية والإنجليزية.',
    },

    hero: {
      eyebrow: 'استوديو برمجيات · الناصرة',
      headingLead: 'حلول ذكاء اصطناعي وبرمجيات،',
      headingAccent: 'تبيع، تؤتمت، وتُشغّل.',
      lede: 'نصمّم ونبني البرمجيات التي يعمل عليها عملك فعلياً — مواقع ومنصات، وكلاء ذكاء اصطناعي، مساعدون يجيبون من مستنداتك أنت، أتمتة تلاحق العمل، أنظمة تسويق، والمحتوى البصري الذي يغذّيها. بالعربية والعبرية والإنجليزية.',
      primary: 'ابدأ مشروعاً',
      secondary: 'شاهد أعمالنا',
      capabilities: [
        'مواقع متعددة اللغات',
        'وكلاء ذكاء اصطناعي',
        'مساعدون من مستنداتك',
        'أتمتة',
        'أنظمة تسويق',
        'محتوى بصري',
        'متاجر إلكترونية',
        'منصات حجز',
        'بوابات جملة',
        'لوحات تحكم',
        'مدفوعات',
        'برمجيات مخصّصة',
      ],
    },

    services: {
      eyebrow: 'ماذا نفعل',
      heading: 'لا مزايا. بل نتائج.',
      lede: 'كل مشروع يبدأ من شيء يكلّفك مالاً أو وقتاً، وينتهي بنظام يعمل من دون أن تراقبه.',
      items: [
        {
          title: 'مواقع ومنصات',
          body: 'مواقع وتطبيقات متعددة اللغات تؤدي عملاً حقيقياً: تستقبل الطلبات، تدير المخزون، تحفظ حسابات العملاء، وتعالج المدفوعات — مع لوحة التحكم التي تخبرك بما حدث اليوم فعلاً. مبنية ليديرها موظفوك، لا نحن.',
        },
        {
          title: 'وكلاء الذكاء الاصطناعي',
          body: 'مساعدون موجّهون لمهمة واحدة محدّدة: تأهيل عميل، الردّ على زبون، تحليل مكالمة، كتابة مسودّة. ويُقاسون على إنجازها.',
        },
        {
          title: 'مساعدون من مستنداتك',
          body: 'إجابات مستخرجة من مستنداتك أنت — عقود، كتالوجات، سياسات، تذاكر سابقة — مع المصدر مرفقاً، ليتحقّق منها موظفوك وزبائنك.',
        },
        {
          title: 'الأتمتة والربط',
          body: 'المتابعات والتأكيدات والتسليمات التي تُنسى حين ينشغل الناس — والربط بين موقعك وتقويمك ونظام العملاء ومحاسبك. هنا تنهار معظم المشاريع بصمت، وهنا يكمن معظم العمل.',
        },
        {
          title: 'أنظمة التسويق',
          body: 'صفحات هبوط، التقاط عملاء، حملات، والمتابعة التي تحوّلها إلى محادثات. مبنية لتُقاس، لا لتُعجب.',
        },
        {
          title: 'المحتوى البصري',
          body: 'صور منتجات، إعلانات، محتوى للسوشال وفيديو — مُولّدة ومُدارة فنياً، بالثلاث لغات التي يقرأها زبائنك فعلاً.',
        },
      ],
      afterLaunch:
        'بعد الإطلاق: مراقبة، نسخ احتياطي، إصلاحات، تعديلات صغيرة — وشخص يردّ حين يتوقف شيء.',
      afterLaunchLink: 'الدعم',
    },

    work: {
      eyebrow: 'أعمال مختارة',
      heading: 'أنظمة تعمل الآن',
      lede: 'كل واحد من هذه الأنظمة يعمل في الإنتاج، باللغة التي يقرأها زبائنه فعلاً. اضغط وتحقّق بنفسك.',
      cta: 'شاهد كل الأعمال',
    },

    industries: {
      eyebrow: 'لمن نبني',
      heading: 'نتعلّم العمل قبل أن نكتب البرمجية',
      lede: 'وكيل عقارات يلاحق معاينة وتاجر جملة يسعّر شحنة بضاعة لا يجمعهما شيء — سوى أن كليهما يخسر مالاً بسبب العمل الإداري.',
      items: [
        'عقارات',
        'مناسبات وأعراس',
        'متاجر وتجزئة',
        'مطاعم وأغذية',
        'جملة و B2B',
        'سياحة وحجوزات',
        'صحة وعافية',
        'خدمات مهنية',
      ],
    },

    languages: {
      heading: 'العربية · العبرية · الإنجليزية',
      body: 'مصمّمة لتجربة أصيلة من اليمين لليسار ومن اليسار لليمين — تخطيط صحيح، اتصال حروف سليم، ونص ثنائي الاتجاه. صُمّمت بثلاث لغات، لا تُرجمت إليها.',
    },

    cta: {
      heading: 'قل لنا ما الذي لا يعمل',
      lede: 'عملاء يبردون لأن أحداً لم يتابعهم. قائمة أسعار تعيش في رأس شخص واحد. حجوزات تُؤخذ بالهاتف، مرّتين. ابدأ من هناك — التقنية مشكلتنا نحن، لا مشكلتك.',
      primary: 'ابدأ مشروعاً',
      secondary: 'شاهد أعمالنا',
    },
  },

  he: {
    meta: {
      title: 'FikraNova — פתרונות AI ותוכנה לעסקים',
      description:
        'סטודיו לפתרונות AI ותוכנה: אתרים ופלטפורמות, סוכני AI, עוזרים שעונים מתוך המסמכים שלכם, אוטומציה, מערכות שיווק ותוכן חזותי — בערבית, עברית ואנגלית.',
    },

    hero: {
      eyebrow: 'סטודיו תוכנה · נצרת',
      headingLead: 'פתרונות AI ותוכנה,',
      headingAccent: 'שמוכרים, מאוטמטים ומפעילים.',
      lede: 'אנחנו מתכננים ובונים את התוכנה שהעסק באמת רץ עליה — אתרים ופלטפורמות, סוכני AI, עוזרים שעונים מתוך המסמכים שלכם, אוטומציות שרודפות אחרי העבודה, מערכות שיווק והתוכן החזותי שמזין אותן. בערבית, עברית ואנגלית.',
      primary: 'התחילו פרויקט',
      secondary: 'ראו את העבודות',
      capabilities: [
        'אתרים רב-לשוניים',
        'סוכני AI',
        'עוזרי RAG',
        'אוטומציה',
        'מערכות שיווק',
        'תוכן חזותי',
        'חנויות אונליין',
        'מערכות הזמנות',
        'פורטלי B2B',
        'דשבורדים',
        'תשלומים',
        'תוכנה בהתאמה אישית',
      ],
    },

    services: {
      eyebrow: 'מה אנחנו עושים',
      heading: 'לא פיצ׳רים. תוצאות.',
      lede: 'כל פרויקט מתחיל ממשהו שעולה לכם כסף או זמן, ונגמר במערכת שרצה בלי שתשגיחו עליה.',
      items: [
        {
          title: 'אתרים ופלטפורמות',
          body: 'אתרים ואפליקציות רב-לשוניים שעושים עבודה אמיתית: מקבלים הזמנות, מנהלים מלאי, מחזיקים חשבונות לקוחות, מעבדים תשלומים — עם הדשבורד שאומר מה באמת קרה היום. בנויים כדי שהצוות שלכם יפעיל אותם, לא אנחנו.',
        },
        {
          title: 'סוכני AI',
          body: 'עוזרים המכוונים למשימה אחת מוגדרת: לסנן ליד, לענות ללקוח, לנתח שיחה, לנסח טיוטה. ונמדדים על ביצועה.',
        },
        {
          title: 'עוזרי RAG',
          body: 'תשובות מתוך המסמכים שלכם — חוזים, קטלוגים, נהלים, פניות קודמות — עם המקור מצורף, כדי שהצוות והלקוחות יוכלו לבדוק.',
        },
        {
          title: 'אוטומציה ואינטגרציות',
          body: 'המעקבים, האישורים וההעברות שנשכחים כשעסוקים — והצנרת בין האתר, היומן, ה-CRM ורואה החשבון. כאן רוב הפרויקטים נשברים בשקט, וכאן רוב העבודה.',
        },
        {
          title: 'מערכות שיווק',
          body: 'דפי נחיתה, לכידת לידים, קמפיינים והמעקב שהופך אותם לשיחות. בנויות כדי להימדד, לא כדי להתפעל מהן.',
        },
        {
          title: 'תוכן חזותי',
          body: 'צילומי מוצר, מודעות, סושיאל ווידאו — מיוצרים ומבויימים, בשלוש השפות שהלקוחות שלכם באמת קוראים.',
        },
      ],
      afterLaunch:
        'אחרי העלייה לאוויר: ניטור, גיבויים, תיקונים, שינויים קטנים — ומישהו שעונה כשמשהו נעצר.',
      afterLaunchLink: 'תמיכה',
    },

    work: {
      eyebrow: 'עבודות נבחרות',
      heading: 'מערכות שרצות עכשיו',
      lede: 'כל אחת מהן רצה בפרודקשן, בשפה שהלקוחות שלה באמת קוראים. לחצו ותבדקו.',
      cta: 'לכל העבודות',
    },

    industries: {
      eyebrow: 'למי אנחנו בונים',
      heading: 'לומדים את העסק לפני שכותבים את הקוד',
      lede: 'למתווך שרודף אחרי סיור ולסיטונאי שמתמחר משטח סחורה אין שום דבר משותף — חוץ מזה ששניהם מפסידים כסף על בירוקרטיה.',
      items: [
        'נדל״ן',
        'אירועים וחתונות',
        'מסחר וקמעונאות',
        'מסעדות ומזון',
        'סיטונאות ו-B2B',
        'תיירות והזמנות',
        'בריאות ורווחה',
        'שירותים מקצועיים',
      ],
    },

    languages: {
      heading: 'ערבית · עברית · אנגלית',
      body: 'מתוכנן לחוויית RTL ו-LTR אמיתית — פריסה נכונה, חיבור אותיות תקין, טקסט דו-כיווני. תוכנן בשלוש שפות, לא תורגם אליהן.',
    },

    cta: {
      heading: 'ספרו לנו מה נשבר',
      lede: 'לידים שמתקררים כי אף אחד לא חזר אליהם. מחירון שחי בראש של אדם אחד. הזמנות שנרשמות בטלפון, פעמיים. תתחילו משם — הטכנולוגיה היא הבעיה שלנו, לא שלכם.',
      primary: 'התחילו פרויקט',
      secondary: 'ראו את העבודות',
    },
  },
};

/**
 * @param {string} lang
 * @returns {object}
 */
export function getHomeContent(lang) {
  return HOME[lang] || HOME.ar;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/home-content.test.mjs`
Expected: PASS — all nine.

- [ ] **Step 5: Commit**

```bash
git add lib/content/home.js tests/home-content.test.mjs
git commit -m "feat: reposition the homepage as an AI solutions and software studio

The page was not positioned as a restaurant agency, but every concrete example
was one — the hero led with 'websites that take orders', the industries list
led with restaurants, the CTA opened on a dinner service. Meanwhile RAG
assistants, marketing systems and visual content — three of the six things the
studio sells — appeared nowhere.

Six offerings; restaurants demoted to one industry of eight. The unverifiable
'17 systems' and '8 industries' counters are removed rather than corrected, and
'one codebase' goes with them: a visitor can verify multilingual support by
switching locale, but not the shape of the repository."
```

---

## Task 6: Homepage render

Wire the new content in: add Selected work + the after-launch strip, replace the proof grid with the language strip.

**Files:**
- Modify: `app/[lang]/page.js`

- [ ] **Step 1: Update the imports**

`app/[lang]/page.js` lines 1-4 become:

```jsx
import Image from 'next/image';
import Link from 'next/link';

import { Container, Section, Eyebrow, Heading, Lede, Button, Card } from '@/components/system';
import Hero from '@/components/home/Hero';
import { getHomeContent } from '@/lib/content/home';
import { getFeaturedProjects } from '@/lib/content/projects';
import { normaliseLocale, alternatesFor } from '@/lib/i18n';
```

- [ ] **Step 2: Load the featured projects**

In `HomePage`, after `const c = getHomeContent(locale);`:

```jsx
  const featured = getFeaturedProjects(locale);
```

- [ ] **Step 3: Add the after-launch strip**

In the "WHAT WE DO" `<Section>`, directly after the closing `</div>` of the services grid and before `</Container>`:

```jsx
          <p className="mt-10 text-[15px] leading-relaxed text-steel">
            {c.services.afterLaunch}{' '}
            <Link href={`/${locale}/support`} className="text-gold underline-offset-4 hover:underline">
              {c.services.afterLaunchLink}
            </Link>
          </p>
```

- [ ] **Step 4: Add the Selected work section**

Insert a new `<Section>` between the "WHAT WE DO" section and the "INDUSTRIES" section:

```jsx
      {/* ============================ SELECTED WORK =====================
          The proof. Real brands, real live links — every URL here was
          verified to return 200. Projects whose sites are down are listed
          on /projects but are NOT featured (see lib/content/projects.js).

          These images are LOGOS, not screenshots — some have a white
          background baked in, others are dark — so they are contained and
          padded on one neutral surface rather than cropped, exactly as
          /projects frames them. Do not describe them as screenshots.
          ================================================================ */}
      <Section>
        <Container>
          <Eyebrow>{c.work.eyebrow}</Eyebrow>
          <Heading className="mt-6">{c.work.heading}</Heading>
          <Lede className="mt-5">{c.work.lede}</Lede>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((project) => (
              <a
                key={project.id}
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="card group flex flex-col overflow-hidden !p-0"
              >
                <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden border-b border-hairline bg-surface-2 p-10">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-contain p-8 transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-semibold text-chalk">{project.title}</h3>
                  <p className="mt-2 text-sm text-steel">{project.industry}</p>
                </div>
              </a>
            ))}
          </div>

          <div className="mt-10">
            <Button href={`/${locale}/projects`} variant="ghost">
              {c.work.cta}
            </Button>
          </div>
        </Container>
      </Section>
```

Note: **no `tags` are rendered.** They are English-only strings in `projects.js`; showing them on `/ar` and `/he` would put English on a localised page. Localising them is Phase 2.

- [ ] **Step 5: Replace the proof grid with the language strip**

Delete the entire "PROOF" `<Section>` (lines 96-115 of the original, the one mapping `c.proof.items`) and put in its place:

```jsx
      {/* ============================== LANGUAGES =======================
          What replaced the proof grid. The old grid claimed "17 systems
          delivered" and "8 industries" — numbers nobody could check, which
          makes them a liability, not a proof. This claim a visitor verifies
          by switching locale and watching the layout flip to RTL.
          ================================================================ */}
      <Section className="border-y border-hairline bg-surface/30">
        <Container>
          <div className="text-center">
            <Heading size="md">{c.languages.heading}</Heading>
            <Lede className="mx-auto mt-5 max-w-prose text-center">{c.languages.body}</Lede>
          </div>
        </Container>
      </Section>
```

- [ ] **Step 6: Verify `project.industry` is a localised string**

`projects.js` stores `industry` as `{ en, ar, he }`. Step 4 renders `{project.industry}` as a string — that only works if `getProjects(lang)` flattens it.

Run: `grep -n -A 12 "export function getProjects" lib/content/projects.js`

If it does not flatten `industry`, rendering an object will throw. Either flatten it in `getProjects`, or change the line in Step 4 to `{project.industry[locale]}`. **Check before assuming.**

- [ ] **Step 7: Verify the page renders in all three locales**

With the dev server running:

```bash
for L in en ar he; do
  echo "--- /$L ---"
  curl -s "http://localhost:3001/$L" -o "/tmp/home-$L.html" -w "%{http_code}\n"
done
```

Expected: `200` for each. Then confirm the repositioning actually reached the browser:

```bash
grep -c "RAG" /tmp/home-en.html          # expect >= 1
grep -c "Online ordering" /tmp/home-en.html   # expect 0
grep -cE "\b17\b" /tmp/home-en.html      # expect 0
```

- [ ] **Step 8: Commit**

```bash
git add "app/[lang]/page.js"
git commit -m "feat: render selected work and the language strip on the homepage

Adds the Selected work section (5 projects, every live URL verified 200) and
the after-launch strip; replaces the proof grid, whose counters nobody could
check, with a language claim a visitor verifies by switching locale."
```

---

## Task 7: Full verification

Nothing is claimed here without being observed.

- [ ] **Step 1: Whole suite green**

Run: `npm test`
Expected: PASS — `contactEmail`, `contact-fields`, `design-tokens`, `home-content`, `projects-featured`.

- [ ] **Step 2: The migrated tokens actually emit CSS**

A source-scan passing does not prove Tailwind generated anything. With the dev server up, pull the compiled stylesheet and confirm each class exists:

```bash
CSS=$(curl -s http://localhost:3001/en | grep -oE '/_next/static/css/[^"]+\.css' | head -1)
for CLASS in bg-chalk text-ink text-steel perf; do
  if curl -s "http://localhost:3001$CSS" | grep -q "\.$CLASS"; then echo "OK      .$CLASS"; else echo "MISSING .$CLASS"; fi
done
```

Expected: all four `OK`.

- [ ] **Step 3: Every featured card resolves**

Assert the **final** status after redirects — `bclick.co` and `rojeh-nadaf.com` both legitimately redirect to `www.`, so a first-hop check would wrongly fail them.

```bash
for u in https://www.eventy.vip https://bclick.co https://www.cicilialtd.com/ https://watermelontours.com https://rojeh-nadaf.com; do
  printf "%-40s %s\n" "$u" "$(curl -sSL -o /dev/null -w '%{http_code}' --max-time 25 "$u")"
done
```

Expected: `200` for all five.

- [ ] **Step 4: Clean production build**

Stop the dev server first — a running dev server holds `.next/dev/lock` and has caused a build to die mid-compile before.

Run: `npm run build`
Expected: build completes, no errors.

- [ ] **Step 5: Lint the changed files**

Root `npm run lint` is known-broken under Next 16 (`next lint` was removed) — do not treat its failure as a regression, and do not try to fix it here.

Run: `npx eslint "app/[lang]/page.js" "app/[lang]/contact/ContactForm.jsx" "app/[lang]/error.js" "app/[lang]/layout.js" components/Header.js lib/content/home.js lib/content/projects.js lib/contactFields.mjs`
Expected: clean.

- [ ] **Step 6: Hand back the checks a human must do**

These **cannot be self-certified** — no browser or screenshot tool is available. Report them as outstanding rather than claiming them:

- Desktop **and mobile** visual check of `/en`, `/ar`, `/he`. Confirm RTL card layout reflows correctly in Arabic and Hebrew.
- Confirm the now-visible `.perf` divider looks right in the Footer, the error page and 404 — it was invisible before this change.
- Tab to the skip link and confirm it is legible on focus (it uses the migrated tokens).

---

## Out of scope for Phase 1

Print-agent release blockers. Dependency advisories. The broken root `npm run lint`.

---

## Phase 2 — carried forward (do not start until Phase 1 ships)

1. `url` becomes optional in `projects.js`; add `slug` + case-study content.
2. `projects/page.js` branches: external `<a>` when `url` exists, internal `<Link href={/[lang]/projects/[slug]}>` when it does not. Makes dead links impossible by construction.
3. New route `app/[lang]/projects/[slug]/page.js` — the case-study page.
4. Expand Projects from 8 to the public-safe subset of the 18 in `/projects-done`.
5. The combined `management-saas` + `tishreen-events` + `print-agent` platform enters as **one project card with a case-study page** — never a dedicated restaurant section on the homepage.
6. Real interface screenshots replace the logos.
7. Localise project tags, then render them.
8. Owner revives KeysMatch, Stella and BrokerAffiliate; flip `featured: true` back on once each returns 200 (the test in Task 4 enforces this — update `BROKEN` there at the same time).

### Task P2-N: Public installer download on the product page

**Requested by the owner:** the .exe download must not live only in the admin panel — it belongs on the product's own page.

**This is a Phase 2 task by necessity, not by choice.** The button needs a page to sit on, and the combined-SaaS project page does not exist until Phase 2 items 1–3 and 5 above are done. It cannot be added in Phase 1.

**No backend work is required.** `app/api/installer/route.js` is *already* public and unauthenticated by deliberate design — its own comment explains that the installer is generic, carries no customer identity or credentials, and is inert until a one-time pairing code (which does come from the protected admin panel) is typed into it. `middleware.js` gates only `/admin*`. So the whole task is a link.

**Files:**
- Modify: `app/[lang]/projects/[slug]/page.js` (created in Phase 2 item 3)
- Modify: `lib/content/projects.js` — add `installer: true` to the combined-SaaS entry only

- [ ] **Step 1: Gate the button on the product, not the page**

Only the print platform has an installer. Add to the combined-SaaS entry in `projects.js`:

```javascript
    installer: true,
```

- [ ] **Step 2: Render the download, and handle the unconfigured case**

In the case-study page, where `project.installer` is set:

```jsx
{project.installer ? (
  <div className="mt-10">
    <a
      href="/api/installer"
      className="inline-block rounded bg-chalk px-5 py-3 font-mono text-[13px] uppercase tracking-[0.12em] text-ink transition-colors hover:bg-white"
    >
      {c.product.download}
    </a>
    <p className="mt-3 text-sm text-steel">{c.product.downloadNote}</p>
  </div>
) : null}
```

`/api/installer` returns a `503` with a JSON explanation when `INSTALLER_DOWNLOAD_URL` is unset, so the button never 404s — but a public visitor should never see raw JSON. Before shipping this publicly, confirm `INSTALLER_DOWNLOAD_URL` is set in the production environment.

- [ ] **Step 3: Add the copy in all three locales**

`c.product.download` = "Download for Windows", `c.product.downloadNote` must state the Windows requirement and the SmartScreen warning (see the blocker below).

> ### ⚠️ Blocker before this ships publicly: the installer is unsigned
>
> The audit's finding #8 stands: **the built installer is not Authenticode signed**, and update signature verification is explicitly disabled in `print-agent/electron-builder.yml:35`.
>
> Inside the admin panel that is tolerable — you are the only person who downloads it, standing at the till. On a **public marketing page** it is a different proposition: every visitor who clicks gets a Windows SmartScreen *"Windows protected your PC — unknown publisher"* full-screen warning, and must click through "More info → Run anyway" to install. On the page whose job is to make the product look credible, that is the worst possible first impression.
>
> Three options, in order of preference:
> 1. **Buy an Authenticode / OV code-signing certificate and sign the installer.** The correct fix. Removes the warning (an EV cert removes it immediately; an OV cert builds SmartScreen reputation over time).
> 2. **Ship the button, accept the warning, and say so in `downloadNote`** — an honest "Windows will warn you that the publisher is unknown; this is expected until our certificate is issued" reads far better than an unexplained scary dialog.
> 3. **Gate the download behind a short form** so it reaches customers you have spoken to, not cold traffic.
>
> Do not publish an unsigned executable to cold public traffic without at least option 2.
