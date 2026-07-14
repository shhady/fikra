# Homepage repositioning — FikraNova (Phase 1)

**Date:** 2026-07-14
**Status:** Design, awaiting approval
**Scope:** Homepage only. Phase 2 (Projects expansion, case-study and product pages) is explicitly out of scope.

---

## Problem

A visitor who does not run a restaurant should still understand, within three seconds, that FikraNova is an AI solutions and software studio.

Today they do not, for two separate reasons.

**The examples are food-service biased.** The homepage is not *positioned* as a restaurant agency — `lib/content/home.js` already sells "business systems" broadly — but every concrete example a visitor meets is a restaurant. The hero lede leads with "websites that take orders". The industries list leads with "Restaurants & food". Integrations name-check "your printer". The closing CTA opens with "Orders taken by phone during service." A non-restaurant visitor reads that and self-selects out.

**Half the offering is invisible.** RAG assistants, marketing systems and visual content — three of the six things the studio actually sells — appear nowhere on the homepage. Not in the hero chips, not in the six service cards.

Two further defects block the work rather than sitting beside it:

- **Dead design tokens.** `bg-paper` (4 uses), `text-carbon` (4), `text-rail` (1) and the `.perf` class are referenced across `components/Header.js`, `components/Footer.js`, `app/[lang]/error.js` and `app/[lang]/not-found.js` but are defined in neither `tailwind.config.js` nor `app/globals.css`. They emit no CSS. The Header renders on the homepage, so its CTA contrast is broken today. (Same failure mode as the `slate` scale bug fixed earlier this session: a token that silently produces nothing.)
- **Unsupported proof.** The homepage claims "17 systems delivered" and "8 industries" with nothing behind them. A counter nobody can check is not proof; it is a liability.

## Non-goals

Deliberately excluded from this change, to keep it reviewable:

- The Restaurant Systems / combined-SaaS product page.
- Expanding Projects from the 8 shown to the 18 in `/projects-done`.
- The contact-form regression (UI does not validate `service`; `lib/contactEmail.mjs` requires it).
- Print-agent release blockers.
- Dependency advisories and the broken root `npm run lint`.

`/projects-done` stays internal and gitignored (`.gitignore:45`). It is used only as a source to *identify* public-safe material. No file is copied out of it in this phase.

## Decisions taken

| # | Decision |
|---|---|
| 1 | Identity: **an AI solutions and software studio that builds practical business systems.** Not an "AI agency" (unprovable, crowded), not a restaurant shop. |
| 2 | Headline: **"AI solutions and software, built to sell, automate and operate."** |
| 3 | Six offerings, fixed. Dashboards folds into Websites & platforms. Integrations merges into Automation. |
| 4 | Restaurant systems gets **no dedicated homepage section**. It is one owned SaaS product among many. |
| 5 | Unsupported counters are **removed**, not corrected. Folder count is not proof. |
| 6 | Dead tokens are **migrated** to the existing `ink / surface / chalk / steel / gold` system, not resurrected. |

---

## Design

### 1. Hero

Keeps the existing `headingLead` / `headingAccent` split so the component is unchanged; only content moves.

- **eyebrow:** `AI solutions & software studio · Nazareth`
- **headingLead:** `AI solutions and software, built to`
- **headingAccent:** `sell, automate and operate.`
- **lede:** states the taxonomy in plain language — websites, AI agents, RAG assistants that answer from your own documents, automations that chase the work, marketing systems and the visuals to feed them. In Arabic, Hebrew and English.
- **capabilities chips:** gain `RAG assistants`, `Marketing systems`, `Visual content`. `Online ordering` remains available but is demoted out of the leading positions.

Applies to all three locales (`en`, `ar`, `he`). Arabic and Hebrew are authored, not machine-translated.

### 2. What we do — six cards

Replaces the current six (Business platforms, Automation, AI agents, Dashboards, Integrations, Support).

| Card | Derivation |
|---|---|
| Websites & platforms | old *Business platforms* + *Dashboards* |
| AI agents | kept, sharpened |
| RAG assistants | **new** |
| Automation & integrations | old *Automation* + *Integrations* |
| Marketing systems | **new** |
| Visual content | **new** |

*Support* is the only card with nowhere to go. It becomes a one-line after-launch strip beneath the grid (monitoring, backups, fixes, someone who answers) rather than a seventh card competing with the offerings.

### 3. Selected work and products — new section

The evidence section. Neutral, varied, industry-spanning.

- Sources from the existing `lib/content/projects.js` — single source of truth, no duplicated copy. A `featured: true` flag selects which projects surface on the homepage.
- Cards use the **real screenshots already in `public/`** (all 8 verified present: `keysmatch.png`, `eventy.jpg`, `bclick.png`, `cicilia.png`, `stella.png`, `watermelon.png`, `brokers.jpg`, `rojeh.png`) and the **real live URLs** already in `projects.js`.
- Featured selection is chosen for *variety*, so no single industry dominates: AI matching (KeysMatch), events (Eventy), B2B wholesale (BClick), e-commerce (Stella), booking (Watermelon Tours), SEO/comparison (BrokerAffiliate).
- Full list stays on `/projects`. The homepage shows a subset and links onward.

**The combined SaaS card** (`management-saas` + `tishreen-events` + `print-agent`): included as **one card among the others**, labelled as an owned product **in development**. It carries no screenshot (none exists), no live link, and **no outcome metrics** — it has shipped to nobody. Presenting an unlaunched product as delivered work in an evidence section would reintroduce exactly the unsupported-proof problem this pass exists to remove.

> **This is the one decision I want confirmed.** The honest alternative is to omit it from the homepage entirely until Phase 2 gives it a screenshot and a page. I have specced it as *included but labelled in-development* because representing the full breadth of what you do is the point of this change. Say if you would rather omit it.

### 4. Proof — counters removed

`17 systems delivered` and `8 industries` are deleted. Neither is checkable.

`3 languages, one codebase` **survives** — it is the one claim the site itself demonstrates. A visitor can switch to Arabic or Hebrew and watch the layout flip to RTL. Proof you can click is proof.

The vacated space is not backfilled with new numbers. The "Selected work and products" section *is* the replacement proof: real screenshots, real URLs, real running systems. Screenshots, testimonials, client logos and outcome metrics are Phase 2 work and are not invented here.

### 5. De-biasing industries and CTA

- **Industries lede:** currently opens "A restaurant at dinner service and an estate agent chasing a viewing…". Rewritten to lead with a non-food pairing.
- **Industry chips:** all 8 retained. `Restaurants & food` stops being first.
- **CTA lede:** currently opens "Orders taken by phone during service. A guest list living in WhatsApp." Rewritten to lead with non-food examples so the last thing a visitor reads is not a restaurant.

### 6. Token migration (prerequisite)

Not a cosmetic tidy — the Header renders on the homepage and its CTA contrast is broken today.

| Dead token | Migrates to | Sites |
|---|---|---|
| `bg-paper` | `bg-chalk` | Header CTA (light-on-dark button) |
| `text-carbon` | `text-ink` | Header CTA label |
| `text-rail` | `text-steel` | Footer separator |
| `.perf` | audit each of 3 uses | `error.js`, `not-found.js`, `Footer.js` |

`.perf` is kept **only** where it is an intentional visual element; where it is vestigial it is removed. Each of the three uses is judged individually rather than blanket-migrated.

---

## Files touched

| File | Change |
|---|---|
| `lib/content/home.js` | hero, services, industries, proof, CTA — all 3 locales |
| `lib/content/projects.js` | add `featured` flag; add combined-SaaS product entry |
| `app/[lang]/page.js` | render the new "Selected work and products" section |
| `components/Header.js` | `bg-paper` / `text-carbon` → `bg-chalk` / `text-ink` |
| `components/Footer.js` | `text-rail` → `text-steel`; audit `.perf` |
| `app/[lang]/error.js`, `app/[lang]/not-found.js` | audit `.perf` |

## Verification

Evidence before assertions. Every item below must be *observed*, not assumed:

1. **Tokens emit CSS.** Fetch the compiled stylesheet from the dev server and confirm rules exist for each migrated class. (A class that generates nothing is exactly how the `slate` and `paper` bugs both hid.)
2. **No dead tokens remain.** `grep -rE "(paper|carbon|rail)\b"` over `app/` and `components/` returns nothing that is not defined.
3. **Homepage renders in all three locales**, `/en`, `/ar`, `/he` — no missing keys, RTL intact.
4. **Every featured card resolves**: image 200s, live URL 200s. No broken card ships.
5. **No unsupported counter survives**: `17` and the industries count are absent from the rendered homepage.
6. Direct ESLint over the changed files passes. (Root `npm run lint` is known-broken under Next 16 and is out of scope.)

## Phase 2 (recorded, not started)

1. Expand Projects from 8 → the public-safe subset of the 18 in `/projects-done`.
2. Real case-study pages: screenshots, outcomes, testimonials.
3. Product page for the combined `management-saas` + `tishreen-events` + `print-agent` platform.
4. Contact-form `service` regression.
5. Print-agent release blockers; dependency advisories; broken root lint.
