# ILI-726 — QA + a11y sweep

**Issue:** [ILI-726](https://linear.app/iliketobuild/issue/ILI-726/1313-qa-a11y-sweep-cross-browser-responsive-lighthouse)
**Date:** 2026-04-24
**Branch:** `emdash/refactor-qa-responsive-migration-3hp`

Full-site QA after the HAS Design migration. Automated checks cover
Chromium (Playwright), axe-core a11y, Lighthouse, and 8 viewports.
Manual checks (Safari, Firefox, iOS Safari) are out of scope for this
CLI-only run — see "Manual follow-ups" below.

## Route inventory (actual vs. issue)

The Linear issue listed `/blog`, `/blog/[slug]`, `/tags/[tag]`, and a
404 page. Only the 404 exists in the actual migration — articles are
rendered on `/` via a client-side reader (per the approved prototype),
so the issue's `/blog*` routes do not apply to this site. The route
set audited:

| Route | Source | Layout |
|---|---|---|
| `/` | `src/pages/index.astro` | `HomepageLayout` |
| `/about` | `src/pages/about.astro` | `HomepageLayout` |
| `/contact` | `src/pages/contact.astro` | `HomepageLayout` |
| `/design-system` | `src/pages/design-system.astro` | `DesignSystemLayout` |
| `/does-not-exist` | Astro default | n/a |
| Article reader | client-toggled overlay on `/` | n/a |

Filed follow-up for consideration: if a standalone `/blog` index or
`/tags/[tag]` archive is still on the roadmap, it's a new feature, not
a QA gap.

## Lighthouse (desktop, 1440×900)

| Route | Performance | Accessibility | Best Practices | SEO |
|---|---:|---:|---:|---:|
| `/` | **99** | 95 | 100 | 100 |
| `/about` | **100** | 94 | 100 | 100 |
| `/contact` | **100** | 95 | 100 | 100 |
| `/design-system` | **99** | 94 | 100 | 100 |

**Thresholds from issue:** Perf ≥ 80 ✅ · A11y ≥ 95 ⚠ (2/4 at 94, see punch list) · Best Practices ≥ 95 ✅

Reports: `verification-screenshots/ili-726/reports/lighthouse-*.json`
Reproduce: `node scripts/run-lighthouse.mjs` (with dev server on :4322).

## Responsive sweep

Playwright spec `tests/ili-726-qa.spec.ts` — 56 tests, all passing.

Viewports: **1440, 1280, 1024, 900, 768, 414, 375, 360**
Routes × viewports = 40 screenshots, plus `article-open-1440` and
`article-open-375`. All in `verification-screenshots/ili-726/`.

### Horizontal-scroll check

`document.documentElement.scrollWidth <= window.innerWidth` at every
viewport × route. **No overflow detected** on any viewport — full
matrix in `verification-screenshots/ili-726/reports/findings.json`.

### Rails (grid + scan + side bars)

Rails are decorative (`aria-hidden="true"`) and controlled by the
BaseLayout `chrome` prop + a `max-width: 900px` CSS hide rule. Verified:

* `chrome="full"` routes (`/`, `/about`, `/contact`, `/design-system`)
  render both rails at **> 900px**.
* Rails are hidden at **≤ 900px** (CSS `max-width: 900px` is inclusive).
* Rails' `display` checked via `getComputedStyle`, not
  `toBeVisible()` — Playwright treats `aria-hidden` as not visible,
  which doesn't match what "rails render" means for decorative chrome.

### Typography sanity

For every route, walked 500 DOM elements and collected
`computedStyle.fontFamily`. Only allowed tokens found: **Lato**,
**JetBrains Mono**, and bare system fallbacks (`sans-serif`,
`monospace`, `-apple-system`, etc.). No stray families.

## Accessibility (axe-core)

Ran axe with WCAG 2.0/2.1 A + AA tags against each route at desktop
(1440) and mobile (375), plus the open article reader.

| Context | Violations | Critical | Serious |
|---|---:|---:|---:|
| `/` desktop | 1 | 0 | 1 |
| `/` mobile | 1 | 0 | 1 |
| `/about` desktop | 1 | 0 | 1 |
| `/about` mobile | 1 | 0 | 1 |
| `/contact` desktop | 1 | 0 | 1 |
| `/contact` mobile | 1 | 0 | 1 |
| `/design-system` desktop | 1 | 0 | 1 |
| `/design-system` mobile | 1 | 0 | 1 |
| Article reader open | 1 | 0 | 1 |

The single serious violation on every route is the same:
`color-contrast` on the left/right **rails** (`#5a5a5c` on `#0a0a0a`,
ratio 2.87 — below WCAG AA 4.5:1). Rails are `aria-hidden="true"`
decorative chrome, so screen readers skip them, but low-vision users
still see them — axe and Lighthouse both flag this. See punch list.

Details: `verification-screenshots/ili-726/reports/axe-*.json`.

## Keyboard nav

From a cold tab start on `/`, the first 20 Tab presses cycle through:
site logo link → Articles / Design System / About / Contact →
back button → prev/next post controls. No focus trap, no keyboard dead
ends. Result: `verification-screenshots/ili-726/reports/keyboard-nav-home.json`.

## Focus indicator

First focusable element on `/` receives UA default `outline: auto 1px`
with `outline-color: rgb(16, 16, 16)` — which on the `#000` body
background is effectively invisible. A custom focus ring is missing.
See punch list.

Result: `verification-screenshots/ili-726/reports/focus-ring.json`.

## Article reader

* Opens when `.post-card` clicked (`#stage.open` class added).
* `Escape` closes; DOM returns to closed state.
* Desktop 1440: reader fills the 70% column.
* Mobile 375: reader renders as full-screen overlay.
* Axe clean in the opened state (same 1 serious = rails).

Screenshots: `article-open-1440.png`, `article-open-375.png`.

## Punch list — follow-ups

Recommended as new Linear issues, not blockers for marking the epic
done (all are pre-existing design decisions or a11y polish, not
regressions from the migration):

1. **Focus ring invisible on black body** — `outline-color:
   rgb(16, 16, 16)` on `#000` is ~1:1 contrast. Add an explicit focus
   style on interactive elements in `tokens.css` / `homepage.css`
   (e.g. `outline: 2px solid var(--white); outline-offset: 2px;`).
   Severity: **serious a11y**. Applies site-wide.

2. **Rail text contrast below WCAG AA** — rails use `--dim` (`#5a5a5c`)
   on `--black` (`#0a0a0a`) = 2.87:1 ratio. This is the sole remaining
   serious axe violation on every route and the reason `/about` +
   `/design-system` Lighthouse a11y score is 94 instead of ≥ 95.
   Rails are `aria-hidden="true"` so SRs skip them, but low-vision
   users still see them. Either brighten the dim token to ~`#8a8a8c`
   (≈ 4.5:1) or accept as an intentional design decision and suppress
   the audit. Severity: **serious a11y, visual-only**. Needs
   design call.

3. **Empty-text logo link** — keyboard nav shows the first focusable
   anchor as `a:` (empty textContent). The logo has `.brand-full` +
   `.brand-short` spans but no accessible name surfaced to axe's
   traversal. Confirm the `aria-label` reaches the `<a>`. Severity:
   **minor a11y**.

4. **Screen-reader landmarks** — issue checklist mentions "nav
   announced, section headings announced, logo has aria-label". These
   were not verified in this automated run (would need a real SR like
   VoiceOver / NVDA). Severity: **unknown**; manual follow-up.

## Manual follow-ups (not automatable from this CLI)

- **Safari latest (macOS)** — run the responsive matrix manually.
- **Safari iOS** — real device or simulator.
- **Firefox latest** — manual; Playwright only ran Chromium per the
  project's `playwright.config.ts` (single `chromium` project).
- **Screen-reader pass** (VoiceOver / NVDA) — manual.
- **1500-word post read-through** — only one article (`hello-world.md`,
  ~1100 words) is currently in the collection. Re-do this gut check
  once a longer post lands.
- **Color contrast AAA for pure B/W** — spot-checked via axe AA pass;
  AAA verification not yet captured. The rails already fail AA; AAA
  will need to wait on item 2.

## Deliverable artifacts

```
docs/audits/QA-ILI-726.md                            # this file
tests/ili-726-qa.spec.ts                             # playwright spec
scripts/run-lighthouse.mjs                           # lighthouse runner
verification-screenshots/ili-726/
  ├─ home-{1440,1280,1024,900,768,414,375,360}.png
  ├─ about-{…same…}.png
  ├─ contact-{…same…}.png
  ├─ design-system-{…same…}.png
  ├─ 404-{…same…}.png
  ├─ article-open-1440.png
  ├─ article-open-375.png
  └─ reports/
     ├─ findings.json                                # hscroll + rails + fonts + axe counts
     ├─ lighthouse-summary.json
     ├─ lighthouse-{home,about,contact,design-system}.json
     ├─ axe-{route}-{desktop,mobile}.json
     ├─ axe-article-open.json
     ├─ keyboard-nav-home.json
     └─ focus-ring.json
```

## Reproduce

```sh
npm install
npx playwright test tests/ili-726-qa.spec.ts   # full QA sweep
# For Lighthouse, in a second shell while dev server runs on :4322:
ASTRO_TEST=1 npm run dev -- --port 4322
node scripts/run-lighthouse.mjs
```
