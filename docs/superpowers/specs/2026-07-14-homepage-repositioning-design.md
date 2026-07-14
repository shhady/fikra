# Homepage repositioning — FikraNova

**Date:** 2026-07-14
**Status:** Design, revised after review — awaiting approval
**Phase 1 scope:** Homepage positioning, proof correction, dead-token migration, contact-form contract fix.
**Phase 2 scope:** Projects platform (url-optional, case-study pages, project expansion, combined SaaS).

---

## Problem

A visitor who does not run a restaurant should still understand, within three seconds, that FikraNova is an AI solutions and software studio.

Today they do not, for two separate reasons.

**The examples are food-service biased.** The homepage is not *positioned* as a restaurant agency — `lib/content/home.js` already sells "business systems" broadly — but every concrete example a visitor meets is a restaurant. The hero lede leads with "websites that take orders". The industries list leads with "Restaurants & food". Integrations name-check "your printer". The closing CTA opens with "Orders taken by phone during service." A non-restaurant visitor reads that and self-selects out.

**Half the offering is invisible.** RAG assistants, marketing systems and visual content — three of the six things the studio sells — appear nowhere on the homepage.

Three further defects block the work rather than sitting beside it:

- **Dead design tokens.** `bg-paper`, `text-carbon`, `text-rail` and `.perf` are used across the Header, layout, Footer, error and not-found pages but are defined in neither `tailwind.config.js` nor `app/globals.css`. They emit no CSS. The Header renders on the homepage, so its CTA contrast is broken today. (Same failure mode as the `slate`-scale bug fixed earlier this session: a token that silently produces nothing.)
- **Unsupported proof.** The homepage claims "17 systems delivered" and "8 industries" with nothing behind them. A counter nobody can check is not proof; it is a liability.
- **A broken destination.** The homepage's primary CTA sends visitors to the contact form, whose client-side validation does not require `service` while `lib/contactEmail.mjs` does. The visitor completes every visibly-required field and receives a generic failure. Repositioning the homepage while its main CTA funnels into a silently-failing form would waste the repositioning.

## Verified findings (do not re-litigate)

Established by direct check during review. Recorded so the implementer does not repeat them.

**Project assets are LOGOS, not screenshots.** `app/[lang]/projects/page.js:63` says so explicitly in a comment: *"These files are LOGOS, not product screenshots."* Some carry a baked-in white background (`eventy.jpg`), others are dark (`keysmatch.png`), which is why the Projects page frames them contained-and-padded on a neutral surface rather than cropping them. No copy anywhere may call them screenshots. Real interface screenshots would sell the work far better and are Phase 2 content work.

**Live-URL health, all 8 checked with redirects followed:**

| Project | Status |
|---|---|
| Eventy, BClick, Cicilia, Watermelon Tours, Rojeh Naddaf | **200 — healthy** |
| KeysMatch | **504** on three consecutive attempts — not a cold start |
| Stella Jewellery | **404** |
| BrokerAffiliate | **TLS handshake failure** — connection refused |

Three of eight are broken in production on the live `/projects` page today. The owner will revive them. Until they return 200 they must not be featured on the homepage.

**Dead-token inventory, exact:**

| Token | Locations |
|---|---|
| `bg-paper` + `text-carbon` | `components/Header.js:73`, `components/Header.js:118`, `app/[lang]/layout.js:118` (skip link), `app/[lang]/error.js:44` |
| `text-rail` | `app/[lang]/error.js:35` (error eyebrow) |
| `.perf` | `app/[lang]/error.js:39`, `app/[lang]/not-found.js:28`, `components/Footer.js:89` |

The dead set (`paper`, `carbon`, `rail`, `perf`) is a coherent *print metaphor* — the residue of an earlier paper/receipt design system.

## Decisions

| # | Decision |
|---|---|
| 1 | Identity: **an AI solutions and software studio that builds practical business systems.** Not an "AI agency" (unprovable, crowded), not a restaurant shop. |
| 2 | Headline: **"AI solutions and software, built to sell, automate and operate."** |
| 3 | Six offerings, fixed. Dashboards folds into Websites & platforms. Integrations merges into Automation. |
| 4 | Restaurant systems gets **no dedicated homepage section**. It is one owned product among many, and it does not appear on the homepage at all in Phase 1. |
| 5 | Unsupported counters are **removed**, not corrected. Folder count is not proof. |
| 6 | Dead tokens are **migrated** to `ink / surface / chalk / steel / gold`, not resurrected. |
| 7 | The homepage features **only projects whose live URL currently returns 200** — five, not six, and not forced to a grid count. |
| 8 | Project **tags are not shown on the homepage**. They are English-only strings in `projects.js`; rendering them on `/ar` and `/he` would put English on a localized page. Localizing them is Phase 2. |

---

## Phase 1 — Homepage

### 1. Hero

Existing `headingLead` / `headingAccent` split retained, so the component is unchanged; only content moves.

- **eyebrow:** `Software studio · Nazareth` — deliberately does *not* repeat "AI"; the H1 says it one line later, and an eyebrow that echoes the headline wastes the slot.
- **headingLead:** `AI solutions and software, built to`
- **headingAccent:** `sell, automate and operate.`
- **lede:** *We design and build the software a business actually runs on — websites and platforms, AI agents, assistants that answer from your own documents, automations that chase the work, marketing systems, and the visuals to feed them. In Arabic, Hebrew and English.*
- **capability chips:** Multilingual websites · AI agents · RAG assistants · Automation · Marketing systems · Visual content · E-commerce · Booking platforms · B2B portals · Dashboards · Payments · Custom software.
  *"Online ordering" is removed from the chip list entirely — it is the single strongest restaurant signal in the hero.*

### 2. Localized metadata

The current `meta.description` still leads with online ordering and the old taxonomy (`home.js:24`). Replaced in all three locales.

- **title:** `FikraNova — AI solutions and software for business`
- **description:** `An AI solutions and software studio: websites and platforms, AI agents, RAG assistants, automation, marketing systems and visual content — in Arabic, Hebrew and English.`

### 3. What we do — six cards

Replaces the current six (Business platforms, Automation, AI agents, Dashboards, Integrations, Support). English reference copy below; Arabic and Hebrew are **authored, not machine-translated**, during implementation, and reviewed in `home.js` rather than duplicated here.

| Card | Body (reference) |
|---|---|
| **Websites & platforms** | Multilingual websites and web apps that do real work: take orders, manage stock, hold customer accounts, process payments — plus the dashboard that tells you what actually happened today. Built so your staff run them, not us. |
| **AI agents** | Assistants pointed at one specific job: qualify a lead, answer a customer, analyse a call, draft the reply. Measured on whether they do it. |
| **RAG assistants** | Answers drawn from your own documents — contracts, catalogues, policies, past tickets — with the source attached, so staff and customers can check the work. |
| **Automation & integrations** | The follow-ups, confirmations and hand-offs that get forgotten when people are busy — and the plumbing between your site, your calendar, your CRM and your accountant. This is where most projects quietly break, and it is most of the work. |
| **Marketing systems** | Landing pages, lead capture, campaigns, and the follow-up that turns them into conversations. Built to be measured, not admired. |
| **Visual content** | Product imagery, ads, social and video — generated and art-directed, in the three languages your customers actually read. |

**After-launch strip** (below the grid, one line, links to the existing `/support` page):
*After launch: monitoring, backups, fixes, small changes — and someone who answers when something stops.*

### 4. Selected work

The evidence section. Real brands, real live links.

- Sources from `lib/content/projects.js` via a `featured: true` flag. Single source of truth — no duplicated copy.
- **Five cards** — Eventy, BClick, Cicilia, Watermelon Tours, Rojeh Naddaf. Every one verified 200. KeysMatch, Stella and BrokerAffiliate are **excluded until they return 200**; when revived, flipping their flag is a one-line change.
- Assets are **logos**, framed exactly as `/projects` already frames them (contained, padded, on `bg-surface-2`). No copy calls them screenshots.
- Chosen for spread, so no industry dominates: events, B2B wholesale, food import, tourism/booking, personal/lead-gen.
- **No tags rendered** (decision 8). Links onward to `/projects` for the full list.
- **The combined SaaS does not appear.** `projects/page.js:55-82` renders every entry as an external `<a href>` wrapping a required `next/image` — an entry with no URL and no image throws rather than degrading. It enters in Phase 2, behind the url-optional contract.

### 5. Proof — counters removed, no replacement invented

`17 systems delivered` and `8 industries` are **deleted**. Neither is checkable.

`3 languages, one codebase` is **also deleted, not kept.** Switching language proves multilingual support; it proves nothing about the repository. "One codebase" fails the visitor-verifiable test just as badly as "17".

The three-counter grid is replaced by a single full-width language strip:

> **Arabic · Hebrew · English** — designed for native RTL and LTR experiences.

That claim a visitor verifies by clicking. The vacated space is not backfilled with new numbers. Testimonials, client logos and outcome metrics are Phase 2 content work and are **not invented here**.

### 6. De-biasing industries and CTA

- **Industries lede** currently opens on a restaurant at dinner service. Rewritten to lead with a non-food pairing: *An estate agent chasing a viewing and a wholesaler pricing a pallet have nothing in common — except that both are losing money to admin.*
- **Industry chips:** all 8 retained; `Restaurants & food` is no longer first. Order: Real estate · Events & weddings · E-commerce & retail · Restaurants & food · Wholesale & B2B · Tourism & booking · Health & wellness · Professional services.
- **CTA lede** currently opens "Orders taken by phone during service." Rewritten so the last thing a visitor reads is not a restaurant: *Leads going cold because nobody followed up. A price list that lives in someone's head. Bookings taken by phone, twice. Start there — the technology is our problem, not yours.*

### 7. Token migration

Not cosmetic: the Header renders on the homepage and its CTA contrast is broken today.

| Dead token | Migrates to | Sites |
|---|---|---|
| `bg-paper` | `bg-chalk` | `Header.js:73`, `Header.js:118`, `layout.js:118`, `error.js:44` |
| `text-carbon` | `text-ink` | same four |
| `text-rail` | `text-steel` | `error.js:35` |

`.perf` is a deliberate decorative divider (3 consistent uses, always `<div className="perf my-8" />`) that was **never implemented** — it renders as an empty spacer today. It is intentional, so it is **defined** in `globals.css` as a hairline rule consistent with the `ink/gold` system.

> **This makes a currently-invisible element visible in three places** (`error.js`, `not-found.js`, `Footer.js`). That is a real visual change, not a no-op. If the divider is not wanted, the alternative is to delete the class from all three call sites — but keeping it undefined is not an option.

### 8. Contact-form contract fix

`ContactForm.jsx` validates name, email and message. `lib/contactEmail.mjs:5` additionally requires `service`. A visitor who fills every visibly-required field gets a generic failure.

Fix: **require `service` client-side**, matching the server contract, with a field-specific error message rather than the generic banner. This is the correct fix — the mismatch is the bug, not the messaging.

### Files touched — Phase 1

| File | Change |
|---|---|
| `lib/content/home.js` | hero, meta, services, industries, proof→language strip, CTA — all 3 locales |
| `lib/content/projects.js` | add `featured` flag to the 5 healthy projects |
| `app/[lang]/page.js` | render Selected work + after-launch strip |
| `components/Header.js` | `bg-paper`/`text-carbon` → `bg-chalk`/`text-ink` (2 sites) |
| `app/[lang]/layout.js` | skip link — same migration |
| `app/[lang]/error.js` | same migration + `text-rail` → `text-steel` |
| `app/globals.css` | define `.perf` |
| `app/[lang]/contact/ContactForm.jsx` | require `service` |

### Verification — Phase 1

Evidence before assertions. Every item observed, not assumed.

1. **Tokens emit CSS.** Fetch the compiled stylesheet from the dev server; confirm a rule exists for each migrated class and for `.perf`. A class that generates nothing is exactly how the `slate` and `paper` bugs both hid.
2. **No dead tokens remain.** `grep -rE "(bg|text|border)-(paper|carbon|rail)\b" app components` returns nothing.
3. **Renders in all three locales** — `/en`, `/ar`, `/he`: no missing keys, RTL intact, cards reflow correctly RTL.
4. **Every featured card resolves**: logo asset 200s; live URL 200s **following redirects** (`bclick.co`→`www.bclick.co` and `rojeh-nadaf.com`→`www.` both redirect legitimately — assert final status, not first hop).
5. **No unsupported counter survives**: `17`, `8 industries`, `one codebase` absent from rendered output in all locales.
6. **Contact form**: submitting with `service` empty is blocked client-side with a field-specific message; submitting complete succeeds.
7. **Clean production build** (`next build`) with no dev server running.
8. **Accessibility**: keyboard focus reaches the skip link and it is visible on focus (it uses the migrated tokens); logo `alt` text is meaningful; external-link affordances are localized, not English-only.
9. Direct ESLint over changed files passes. Root `npm run lint` is known-broken under Next 16 (`next lint` removed) and is out of scope.

**Verification that requires a human.** No browser or screenshot tool is available in the implementing session. The following were requested at review and **cannot be self-certified** — they must be done by the owner, or the claim must not be made:

- Desktop and mobile *visual* checks at `/en`, `/ar`, `/he`. Markup and CSS can be asserted programmatically; "it looks right at 375px" cannot.
- Visual confirmation of the newly-visible `.perf` divider.

Everything else above is machine-checkable and will be checked, not assumed.

---

## Phase 2 — Projects platform (recorded, not started)

Triggered by the owner's decision that projects without a live URL should open a dedicated page.

1. **`url` becomes optional** in `projects.js`; add `slug`, and case-study content.
2. **`projects/page.js` branches**: external `<a target="_blank">` when `url` is present; internal `<Link href={/projects/[slug]}>` when it is not. This also makes broken links impossible by construction — a project whose site dies falls back to its own page.
3. **New route** `app/[lang]/projects/[slug]/page.js` — case study: problem, what was built, outcome.
4. **Expand Projects** from 8 to the public-safe subset of the 18 in `/projects-done` (any project with a usable logo).
5. **Combined SaaS** (`management-saas` + `tishreen-events` + `print-agent`) enters as one project card with an internal case-study page — never a dedicated restaurant section.
6. **Real interface screenshots** replace logos.
7. **Localize project tags**, then render them.
8. Owner revives KeysMatch, Stella, BrokerAffiliate; flip `featured` back on once each returns 200.

`/projects-done` stays internal and gitignored (`.gitignore:45`). Nothing is copied out of it without explicit public-safety review.

## Out of scope, both phases

Print-agent release blockers; dependency advisories; broken root `npm run lint`; privacy-page disclosures for the print platform.
