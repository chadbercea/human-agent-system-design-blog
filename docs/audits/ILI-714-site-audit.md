# ILI-714 — Site audit (1/13)

Inventory of the Astro blog as it stands. Pure reconnaissance. No code
changes in this issue. The output here becomes the work list for ILI-715
through the rest of the 13-issue site cleanup.

Captured against `main` at commit `5ae996f` (2026-04-23).

---

## TL;DR — the headline mismatch

The site currently runs **two visual systems on the same domain**:

1. **Homepage system** (`/`, `/about`, `/contact`) — the prototype port
   from ILI-665. Source Serif 4 prose, Lato display, Montserrat eyebrows,
   JetBrains Mono code. Background `#0a0a0a` (warm near-black). Text in
   warm grays (`#c8c8c8`, `#909090`, `#9a9a9a`). Uses `vw`-based
   responsive typography per the prototype non-negotiables.
2. **Design system page** (`/design-system`) — the brand showcase from
   ILI-699 → ILI-711. Lato + JetBrains Mono only. Pure black `#000000`
   on pure white `#ffffff` (the page itself declares "21:1 contrast,
   zero hue, two values"). Uses pixel + `clamp()` typography. Loads
   Lato and JetBrains Mono from Google Fonts CDN.

These two systems contradict each other on **every** axis the design
system page formally defines: palette (warm grays vs. zero hue), font
roster (4 families vs. 2), font loading (local woff2 vs. Google Fonts),
and the typography rule (vw vs. clamp). Whichever direction we pick,
the other side has to move. See [Mismatch list](#6-mismatch-list).

---

## 1. Route map

Everything the site currently serves. Generated from `src/pages/`,
`astro.config.mjs`, and `@astrojs/sitemap`.

| Route                | Source                                | Type    | Notes                                                                                |
| -------------------- | ------------------------------------- | ------- | ------------------------------------------------------------------------------------ |
| `/`                  | `src/pages/index.astro`               | static  | Articles index + in-page article reader (no per-article URL).                        |
| `/about`             | `src/pages/about.astro`               | static  | Prose page.                                                                          |
| `/contact`           | `src/pages/contact.astro`             | static  | Prose page + mailto form.                                                            |
| `/design-system`     | `src/pages/design-system.astro`       | static  | Brand showcase. Uses its own layout and CSS (the "techno black" system).             |
| `/sitemap-index.xml` | `@astrojs/sitemap` integration        | static  | Auto-generated at build by `astro.config.mjs` integrations array.                    |
| `/sitemap-0.xml`     | `@astrojs/sitemap` integration        | static  | Auto-generated.                                                                      |
| `/favicon.svg`       | `public/favicon.svg`                  | static  | 3-line "menu" placeholder glyph. Not the HAS bars logo.                              |
| `/robots.txt`        | `public/robots.txt`                   | static  | **Contains placeholder `https://your-domain.com/sitemap-index.xml`.**                |

### Routes the issue description anticipated but that **do not exist**

| Anticipated route   | Status                  | Note                                                                                                |
| ------------------- | ----------------------- | --------------------------------------------------------------------------------------------------- |
| `/blog`             | **not implemented**     | Articles are read inline on `/`; there is no separate `/blog` index.                                |
| `/blog/[slug]`      | **not implemented**     | No per-article URL exists. Reader is JS-driven on `/` and binds content from a hidden DOM dump.     |
| `/tags/[tag]`       | **not implemented**     | Tag taxonomy exists in frontmatter but is not surfaced anywhere as a route or filter.               |
| `/rss.xml`          | **not implemented**     | `@astrojs/rss` is in `dependencies` but no feed route exists.                                       |

This is a deliberate architectural choice from the prototype port (the
reader is part of the homepage), not an oversight. Whether we keep it
that way is a separate decision — flagged in section 6.

---

## 2. Component inventory

The codebase is intentionally minimal. No framework integrations
(no React/Vue/Svelte), no Tailwind, no CSS-in-JS. Everything is
`.astro` + plain CSS.

### Layouts

| Path                                   | Purpose                                                                                  |
| -------------------------------------- | ---------------------------------------------------------------------------------------- |
| `src/layouts/BaseLayout.astro`         | Wraps the homepage system pages. Imports `fonts.css` + `homepage.css`. Renders header, slot, footer. |
| `src/layouts/DesignSystemLayout.astro` | Wraps `/design-system` only. Imports `design-system.css`. Adds vertical rails. **Loads Lato + JetBrains Mono from Google Fonts CDN, ignoring local fonts.** |

### Pages

| Path                              | Layout                  | Notes                                                                  |
| --------------------------------- | ----------------------- | ---------------------------------------------------------------------- |
| `src/pages/index.astro`           | `BaseLayout`            | 3-column stage, JS article reader, hidden-dump content rehydration.    |
| `src/pages/about.astro`           | `BaseLayout`            | `.prose-page` / `.prose-inner`. Static copy.                           |
| `src/pages/contact.astro`         | `BaseLayout`            | Same prose shell + a single mailto form.                               |
| `src/pages/design-system.astro`   | `DesignSystemLayout`    | 5 panels: Principles, Typography, Palette, Logo, Readout.              |

### Styles (global CSS)

| Path                              | Imported by                          | Notes                                                                |
| --------------------------------- | ------------------------------------ | -------------------------------------------------------------------- |
| `src/styles/fonts.css`            | `BaseLayout`                         | `@font-face` for Source Serif 4, Lato Black, Montserrat, JetBrains Mono + the four `--font-*` custom properties. |
| `src/styles/homepage.css`         | `BaseLayout`                         | All visual styling for `/`, `/about`, `/contact`. Includes a 900px mobile breakpoint and the homepage header/nav/footer styles. |
| `src/styles/design-system.css`    | `DesignSystemLayout`                 | All visual styling for `/design-system`. Self-contained. Declares its own `--font-mono`, `--font-sans` and color tokens — does **not** reuse `fonts.css`'s tokens. |

### Content

| Path                                            | Schema                                                                | Files |
| ----------------------------------------------- | --------------------------------------------------------------------- | ----- |
| `src/content/config.ts`                         | `articles` collection: `title`, `date`, `description?`, `draft?`, `tags?` | n/a   |
| `src/content/articles/`                         | Markdown                                                              | **1** (`hello-world.md`) |

CLAUDE.md describes a 6-article series planned for Dec 2025 → Jan 2026
(see `## Content — Articles`). **None of those 6 stub files exist on
disk.** The collection currently has only `hello-world.md`. Either the
stubs were never landed or they live on an unmerged branch. Flagged in
section 6.

### Public assets

| Path                            | Notes                                                              |
| ------------------------------- | ------------------------------------------------------------------ |
| `public/favicon.svg`            | 3-line menu glyph. Not the HAS bars logo.                          |
| `public/robots.txt`             | Placeholder sitemap URL.                                           |
| `public/fonts/`                 | 8 woff2 files: Source Serif 4 ×4 weights, Lato Black, Montserrat, JetBrains Mono ×2 weights. |

### Other

- No client-side framework components.
- Two `<script is:inline>` blocks: the article reader on `index.astro`
  and the mailto submit on `contact.astro`. Both vanilla JS.

---

## 3. Typography audit

What is actually rendering, by route. All sizes are the **declared**
CSS values from `src/styles/`; verified visually against the screenshots
listed at the end of each row.

### Homepage system (`/`, `/about`, `/contact`)

| Element                  | Family            | Weight | Size (desktop)   | Size (≤900px)   | Letter-spacing | Notes                                               |
| ------------------------ | ----------------- | ------ | ---------------- | --------------- | -------------- | --------------------------------------------------- |
| `body` (default prose)   | Source Serif 4    | 400    | inherits (1rem)  | inherits        | normal         | `--font-prose`. Sets the page text default.         |
| `.brand` (header)        | Montserrat        | 700    | `0.9vw`          | `13px`          | `0.18em`       | Uppercase. `--font-ui`.                             |
| `.nav a`                 | Montserrat        | 700    | `0.9vw`          | `11px`          | `0.12em`       | Uppercase.                                          |
| `.eyebrow` (hero)        | Montserrat        | 700    | `0.9vw`          | `11px`          | `0.18em`       | Uppercase.                                          |
| `.h1` (hero)             | Lato              | 700    | `7vw`            | `44px`          | `-0.04em`      | `--font-display`. Black weight loaded as 900 but used at 700. |
| `.desc` (hero)           | Source Serif 4    | 400 (italic) | `1.4vw`     | `17px`          | normal         | Italic.                                             |
| `.list-label`            | Montserrat        | 700    | `0.75vw`         | `11px`          | `0.18em`       | Uppercase.                                          |
| `.ai-meta` (article row) | JetBrains Mono    | 400    | `0.75vw`         | `11px`          | `0.1em`        | `--font-mono`.                                      |
| `.ai-title` (article row)| Source Serif 4    | 400    | `1.4vw`          | `17px`          | normal         | Color shifts on hover.                              |
| `.art-eyebrow` (reader)  | Montserrat        | 700    | `0.75vw`         | `12px`          | `0.18em`       | Uppercase.                                          |
| `.art-h1` (reader)       | Lato              | 700    | `3.5vw`          | `32px`          | `-0.03em`      |                                                     |
| `.art-lede` (reader)     | Source Serif 4    | 400 (italic) | `1.3vw`     | `19px`          | normal         |                                                     |
| `.art-body` (reader)     | Source Serif 4    | 400    | `1.1vw`          | `17px`          | normal         | `line-height: 1.65`.                                |
| `.art-body h2`           | Source Serif 4    | 700    | `1.5vw`          | `20px`          | `-0.01em`      |                                                     |
| `.prose-h1` (about/contact) | Lato           | 700    | `4vw`            | `32px`          | `-0.03em`      |                                                     |
| `.prose-lede`            | Source Serif 4    | 400 (italic) | `1.65vw`    | `20px`          | normal         |                                                     |
| `.prose-body`            | Source Serif 4    | 400    | `1.4vw`          | `17px`          | normal         | `line-height: 1.8`.                                 |
| `.contact-label`         | Montserrat        | 700    | `0.75vw`         | `11px`          | `0.18em`       | Uppercase.                                          |
| `.contact-form input/textarea` | Source Serif 4 | 400 | `1.2vw`          | `16px`          | normal         |                                                     |
| `.contact-send` button   | Montserrat        | 700    | `0.85vw`         | `11px`          | `0.18em`       | Uppercase.                                          |
| `.footer span`           | Montserrat        | 700    | `0.75vw`         | `11px`          | `0.18em`       | Uppercase.                                          |

Screenshots: `verification-screenshots/desktop-default.png`,
`desktop-article-open.png`, `desktop-about.png`, `desktop-contact.png`,
plus the `mobile-*` siblings.

### Design-system system (`/design-system`)

| Element              | Family          | Weight | Size                          | Letter-spacing | Notes                                          |
| -------------------- | --------------- | ------ | ----------------------------- | -------------- | ---------------------------------------------- |
| `body`               | Lato            | 300    | inherits                      | normal         | `--font-sans`. Light weight default.           |
| `.rail`              | JetBrains Mono  | 500    | `10px`                        | `0.45em`       | Vertical sidebars.                             |
| `.topbar .name`      | JetBrains Mono  | 600    | `11px`                        | `0.3em`        | Uppercase.                                     |
| `.topbar .kv`        | JetBrains Mono  | 500    | `10px`                        | `0.2em`        | Uppercase.                                     |
| `.hud-corner`        | JetBrains Mono  | 500    | `10px`                        | `0.22em`       | Uppercase. 4 corner overlays.                  |
| `.hero-meta`         | JetBrains Mono  | 500    | `11px`                        | `0.4em`        | Uppercase.                                     |
| `.principles-quote`  | Lato            | 300    | `clamp(28px, 4.4vw, 56px)`    | `-0.035em`     | Light italic-style display sentence.           |
| `.triad-cell .cell-name` | Lato        | 900    | `52px`                        | `-0.04em`      |                                                |
| `.triad-cell .cell-def`  | Lato        | 300    | `17px`                        | normal         |                                                |
| `.spec-display .huge`    | Lato        | 900    | `clamp(160px, 22vw, 260px)`   | `-0.06em`      | Type-specimen "Aa".                            |
| `.spec-display--mono .huge` | JetBrains Mono | 500 | `clamp(140px, 20vw, 220px)`  | `-0.03em`      | Type-specimen "AA".                            |
| `.spec-pangram`      | Lato            | 300    | `clamp(24px, 3.2vw, 34px)`    | `-0.02em`      |                                                |
| `.spec-pangram--mono`| JetBrains Mono  | 400    | `clamp(14px, 1.5vw, 16px)`    | `0.1em`        | Uppercase.                                     |
| `.swatch-hex`        | JetBrains Mono  | 500    | `clamp(40px, 6vw, 64px)`      | `-0.01em`      |                                                |
| `.swatch-name`       | Lato            | 900    | `48px`                        | `-0.04em`      |                                                |
| `.term-body`         | JetBrains Mono  | 400    | `12px`                        | normal         | Terminal log lines.                            |
| `.footer` (DS)       | JetBrains Mono  | 500    | `10px`                        | `0.3em`        | Different from homepage footer.                |

Screenshots: `verification-screenshots/ili-703-shell-*.png` through
`ili-711-footer-*.png`.

### Cross-cutting observations

- **Two completely different rosters per page.** Homepage uses 4
  families. Design-system page uses 2 of those 4, plus loads them
  again from Google Fonts CDN (`DesignSystemLayout.astro:26`).
- **Two completely different scaling strategies.** Homepage is pure
  `vw` on desktop / pure `px` on mobile (per `CLAUDE.md`
  non-negotiables). Design-system page uses `clamp()` with px floors
  and ceilings everywhere.
- **No `rem` font sizes anywhere.** Both systems comply with the
  prototype "no rem for font sizes" rule (homepage by `vw`,
  design-system by `px`/`clamp`).
- **Lato is loaded twice.** Once locally as `Lato-Black.woff2` (weight
  900 only) for `BaseLayout`, and again via Google Fonts CDN for
  `DesignSystemLayout` (weights 100, 300, 400, 700, 900). The local
  copy doesn't cover the weights the design-system page actually uses
  at runtime — DS pages depend on the CDN call to render correctly.

---

## 4. Color audit

Every color value declared anywhere in the codebase. Grouped by where
it lives. Hex/rgb values lifted directly from the CSS files.

### Homepage system tokens (`src/styles/homepage.css`)

The homepage doesn't declare named tokens — everything is inline hex.

| Hex / rgba                     | Where used                                          | Role                                  |
| ------------------------------ | --------------------------------------------------- | ------------------------------------- |
| `#0a0a0a`                      | `body` background, header bg, footer bg, mobile reader bg | Page canvas. **Warm near-black, not pure black.** |
| `#1c1c1c`                      | All borders (header bottom, col separators, list item separators, prose-lede border, scrollbar thumb, footer top, contact form bottom-borders, contact button border) | The single divider color.             |
| `#c8c8c8`                      | Body text, `.brand`, `.nav a.on`/`:hover`, `.h1`, `.art-h1`, `.art-body h2`, `.prose-h1`, contact input focus border, contact button label, `.mobile-back:hover` | Primary foreground.                   |
| `#9a9a9a`                      | `.desc`, `.art-lede`, `.prose-lede`                 | Italic ledes.                         |
| `#909090`                      | `.ai-title` (default), `.art-body`, `.prose-body`   | Body prose tone.                      |
| `#858585`                      | `.eyebrow`, `.list-label`, `.art-eyebrow`, `.contact-label`, `.footer span`, `.nav a` (default), `.mobile-back` | UI labels (Montserrat eyebrows).      |
| `#7a7a7a`                      | `.ai-meta`, `.ai-date`, `.back-btn`, `.art-end`, `.art-body li::marker` | Tertiary / mono code labels.          |
| `rgba(255,255,255,0.015)`      | `.article-item:hover` background                    | Hover wash.                           |
| `rgba(255,255,255,0.03)`       | `.article-item.active` background                   | Active wash.                          |

### Design-system tokens (`src/styles/design-system.css`)

The design-system page **does** declare named tokens, then declares
formally on the page itself that the palette is "Two Values · Zero
Hue · 21:1 Contrast".

| Token              | Hex / rgba                | Role declared on page                                       |
| ------------------ | ------------------------- | ----------------------------------------------------------- |
| `--black`          | `#000000`                 | "Void" / canvas / ground.                                   |
| `--near-black`     | `#050506`                 | Terminal background.                                        |
| `--white`          | `#ffffff`                 | "Signal" / mark / figure.                                   |
| `--rule`           | `rgba(255,255,255,0.08)`  | Standard rule.                                              |
| `--rule-strong`    | `rgba(255,255,255,0.22)`  | Stronger rules / panel separators.                          |
| `--rule-hud`       | `rgba(255,255,255,0.32)`  | HUD corner brackets.                                        |
| `--dim`            | `#5a5a5c`                 | Tertiary mono text.                                         |
| `--mid`            | `#8a8a8c`                 | Secondary mono text.                                        |
| `--light`          | `#c4c4c6`                 | Body display copy on dark.                                  |

Plus three inline raw values that bypass the tokens:
`#777` (`.swatch--white .swatch-top` color),
`#888` (`.variant--light .variant-top` color),
`rgba(255,255,255,0.06)` and `rgba(255,255,255,0.35)` (the topbar dot
glow). All three are inside the white-on-black swatches so the dim
greys live on the white side — not strictly off-palette, but they're
ungoverned.

### Anything outside black/white/grays?

**No saturated colors anywhere.** Both systems are achromatic. The
"violation" isn't hue — it's that the two achromatic palettes don't
match each other. Homepage is `#0a0a0a` + warm grays in the `c8/9a/90/85/7a`
band; design-system is `#000` + zero-hue grays in the `c4/8a/5a` band.

### Quick alignment table

| Concept           | Homepage value | Design-system value | Drift |
| ----------------- | -------------- | -------------------- | ----- |
| Page background   | `#0a0a0a`      | `#000000`            | Yes — design-system claims pure black is canonical. |
| Primary foreground| `#c8c8c8`      | `#ffffff` / `#c4c4c6`| Yes — DS uses pure white. |
| Body text         | `#909090`      | `#c4c4c6` (`--light`)| Yes — DS body is brighter. |
| UI label          | `#858585`      | `#8a8a8c` (`--mid`)  | Close but different. |
| Tertiary / mono   | `#7a7a7a`      | `#5a5a5c` (`--dim`)  | DS is darker. |
| Border / rule     | `#1c1c1c` (solid) | `rgba(255,255,255,0.08)` (alpha)| Different mechanism entirely. |

---

## 5. Pattern catalog

Every reusable visual pattern that exists today, what file owns it,
and the screenshot it appears in.

### Shared / homepage patterns

| Pattern                     | Owned by                                                | Reference screenshot                                    |
| --------------------------- | ------------------------------------------------------- | ------------------------------------------------------- |
| Header (brand + nav)        | `BaseLayout.astro:38-49` + `homepage.css:.header / .nav`| `verification-screenshots/desktop-default.png`          |
| Footer (HAS Design / MMXXVI)| `BaseLayout.astro:53-56` + `homepage.css:.footer`       | `verification-screenshots/desktop-default.png`          |
| Hero (eyebrow + h1 + desc)  | `index.astro:46-50` + `homepage.css:.hero-inner`        | `verification-screenshots/desktop-default.png`          |
| Article list (rows)         | `index.astro:60-71` + `homepage.css:.article-list`      | `verification-screenshots/desktop-default.png` (right column) |
| Article row hover state     | `homepage.css:.article-item:hover`                      | `verification-screenshots/desktop-hover.png`            |
| Article reader (in-page)    | `index.astro:72-85` + `homepage.css:.col-article`       | `verification-screenshots/desktop-article-open.png`     |
| Article body prose          | `homepage.css:.art-body` (h2, p, ul/ol, li::marker)     | `verification-screenshots/desktop-article-open.png`     |
| Vertical "Back" rail        | `index.astro:51-57` + `homepage.css:.back-btn / .back-content` | `verification-screenshots/desktop-article-open.png` (left) |
| Mobile back bar (overlay)   | `index.astro:73-76` + `homepage.css:.mobile-back`       | `verification-screenshots/mobile-article-open.png`      |
| Prose page (about/contact)  | `homepage.css:.prose-page / .prose-inner`               | `verification-screenshots/desktop-about.png`            |
| Contact form (mailto)       | `contact.astro:13-27` + `homepage.css:.contact-form`    | `verification-screenshots/desktop-contact.png`          |
| Send button                 | `homepage.css:.contact-send`                            | `verification-screenshots/desktop-contact.png`          |

### Design-system page patterns

| Pattern                              | Owned by                                              | Reference screenshot                                   |
| ------------------------------------ | ----------------------------------------------------- | ------------------------------------------------------ |
| Vertical rails (left/right)          | `DesignSystemLayout.astro:37-38` + `design-system.css:.rail` | `verification-screenshots/ili-703-shell-desktop.png`   |
| Topbar (HAS / STYLE + KVs)           | `design-system.astro:5-15` + `design-system.css:.topbar` | `verification-screenshots/ili-704-topbar-desktop.png`  |
| Hero (logo + meta + 4 HUD corners)   | `design-system.astro:17-68` + `design-system.css:.hero` | `verification-screenshots/ili-705-hero-desktop.png`    |
| Panel header (`// 0X` / TITLE / META)| `design-system.css:.panel-head`                       | All `ili-707..ili-711` screenshots                     |
| Vertical panel rail                  | `design-system.css:.panel-rail`                       | All `ili-707..ili-711` screenshots                     |
| Triad cards (Human / Agent / System) | `design-system.astro:82-116` + `design-system.css:.triad` | (no dedicated screenshot — visible in full-page DS captures) |
| Footnotes row                        | `design-system.astro:118-122` + `design-system.css:.footnotes` | (full-page DS captures)                          |
| Type specimen (sans + mono)          | `design-system.astro:133-182` + `design-system.css:.specimen / .spec-*` | `verification-screenshots/ili-707-typography-fullpage-desktop.png` |
| Glyph grid                           | `design-system.css:.glyph-grid / .glyph`              | `ili-707-typography-desktop.png`                       |
| Palette swatch (Void / Signal)       | `design-system.astro:193-217` + `design-system.css:.palette-grid / .swatch` | `verification-screenshots/ili-708-palette-desktop.png` |
| Logo bars + scale bed                | `design-system.astro:228-267` + `design-system.css:.logo-stage / .scales-bed / .shell--lg/md/sm` | `verification-screenshots/ili-709-logo-desktop.png`    |
| Logo positive/negative variants      | `design-system.astro:269-298` + `design-system.css:.variants / .variant--dark / --light` | `verification-screenshots/ili-709-logo-desktop.png`    |
| Terminal readout                     | `design-system.astro:316-340` + `design-system.css:.term / .term-body / .term-line` | `verification-screenshots/ili-710-readout-desktop.png` |
| Design-system footer                 | `design-system.astro:343-349` + `design-system.css:.footer` | `verification-screenshots/ili-711-footer-desktop.png`  |

### Patterns that the issue listed but that **don't exist yet**

- **Card** — articles render as bordered list rows on `/`, not cards. No card pattern anywhere.
- **Tag chip / tag pill** — tags are stored in frontmatter and show up
  inside the eyebrow string on the article list (`HAS-D · 2026.04.22 · 1 min read`),
  but there is no standalone tag UI element.
- **Code block** — there is no `pre` / `code` styling in `homepage.css`
  or `design-system.css`. The only article (`hello-world.md`) has no
  code in it; if the next article does, it will render in the browser
  default monospace at the browser default size.
- **Button** (general) — only one button-like element exists outside
  the article reader: `.contact-send`. There's no shared button
  pattern.
- **Form** (general) — only `.contact-form` exists. No newsletter,
  subscribe, search, or filter forms.

---

## 6. Mismatch list

Concrete, actionable items. Each one is a candidate for one of the
remaining 12 cleanup issues (ILI-715 → ILI-726). Severity reflects how
much downstream work it implies, not aesthetic preference.

### A. Two competing visual systems on the same site (highest)

1. **Background color contradiction.** Homepage runs on `#0a0a0a`;
   `/design-system` declares `#000000` as canonical "Void". Pick one
   and align the other. (`homepage.css:7`, `design-system.css:4`.)
2. **Foreground color contradiction.** Homepage primary text is `#c8c8c8`;
   `/design-system` primary is `#ffffff`. Same call to make.
3. **Font roster contradiction.** Homepage uses 4 families (Source
   Serif 4, Lato, Montserrat, JetBrains Mono); design-system page
   declares the system is **2 voices** (Lato + JetBrains Mono only).
   Either Source Serif 4 + Montserrat get added to the design-system
   page, or they get removed from the homepage. The design-system
   page's "Two Voices" copy is currently false.
4. **Font loading mechanism mismatch.** Homepage loads woff2 from
   `/public/fonts/`. Design-system page loads from Google Fonts CDN
   (`DesignSystemLayout.astro:26`). Pick local-or-CDN once.
5. **Lato is loaded twice with non-overlapping weight coverage.**
   Local copy is weight 900 only; CDN call is 100/300/400/700/900.
   Design-system page uses 100, 300, 700, 900 — none of which are
   covered by the local file. Either load all needed weights locally
   or drop the local file in favor of CDN.
6. **Typography scaling rule mismatch.** Homepage is pure `vw`/`px`
   per the prototype non-negotiables in `CLAUDE.md`. Design-system
   page uses `clamp()` extensively. The CLAUDE.md rule says no
   `clamp()` for font sizes — design-system page violates this.
7. **Border / rule mechanism mismatch.** Homepage uses solid `#1c1c1c`
   borders. Design-system page uses three different alpha rules
   (`--rule`, `--rule-strong`, `--rule-hud`). Pick a system.

### B. Routes the issue description anticipated but that don't exist

8. **No `/blog` index, no `/blog/[slug]` per-article URLs, no
   `/tags/[tag]` taxonomy, no `/rss.xml`.** This is the biggest
   architectural gap between the prototype and a "real" blog. The
   prototype port shipped a homepage-as-reader pattern (article body
   is rehydrated from a hidden DOM dump on `/`); none of the
   articles have addressable URLs, which means no shareable links,
   no SEO surface area for individual posts, no search-engine
   indexing of post content, no RSS. Each one of these is its own
   downstream issue.
9. **`@astrojs/rss` is in `package.json` but no feed exists.** Either
   ship the feed or remove the dep.

### C. Content gaps

10. **Five of the six planned article stubs are missing.** `CLAUDE.md`
    documents 6 stubs that should exist (`agents-arent-personas.md`
    through `the-career-path-for-has-designers.md`). Only
    `hello-world.md` is on disk. Either land the stubs or update
    CLAUDE.md to match reality.

### D. Public asset / config issues

11. **`public/robots.txt` ships placeholder `your-domain.com`.**
    Replace with the real domain (or remove the `Sitemap:` line until
    we know the prod URL).
12. **Favicon is a generic 3-line "menu" glyph.** Should be the HAS
    bars logo from `/design-system` (or a single-bar derivative
    sized for 32px).
13. **Default `og:image` is missing.** `BaseLayout` sets `og:type`,
    `og:title`, `og:description`, `og:url` but no `og:image`. Same
    in `DesignSystemLayout`. Social previews currently render
    text-only.

### E. Pattern gaps

14. **No code-block styling.** First article that ships a `<pre><code>`
    will fall back to browser default monospace at default size. Add
    one once Source Serif 4 / JetBrains Mono is reconciled (see #3).
15. **No tag UI.** Tags exist in frontmatter and appear concatenated
    into the eyebrow line on the article list. Decide if they need
    a chip pattern, a dedicated `/tags/[tag]` route, or to stay as
    eyebrow text.
16. **No reusable button pattern.** Only `.contact-send` exists. If
    any future page needs a CTA, button, or link styled as button,
    we'll either duplicate `.contact-send` or extract it now. Likely
    a candidate for the design-system page once #1–#7 land.

### F. Smaller cosmetic / consistency items

17. **Two different footer designs.** `BaseLayout` footer is a single
    line ("HAS Design" / "MMXXVI"). `DesignSystemLayout` footer is
    a 5-column meta strip with build hash. Decide if these are
    intentionally different (page-type-specific) or should converge.
18. **Two different header designs.** `BaseLayout` has the brand-text
    + nav. `DesignSystemLayout` has the topbar with the live dot,
    KV strip, and channel marker. Same question.
19. **The design-system page has no nav.** Unlike `/`, `/about`,
    `/contact`, the design-system page renders inside its own layout
    with no link back to the rest of the site (other than the
    prototype hard-coded `<a href="/">` in the original prototype —
    not present in `design-system.astro`). Easy to get stranded.
20. **Two `<script is:inline>` blocks** on different pages duplicate
    DOM-ready boilerplate. Low priority but a candidate for a tiny
    shared util once a third script appears.

---

## Acceptance — checklist

- [x] All public routes enumerated (section 1).
- [x] All components enumerated with file paths (section 2).
- [x] Typography audit complete with screenshots (section 3, references
      `verification-screenshots/`).
- [x] Color audit complete with screenshots (section 4, same).
- [x] Pattern catalog complete with screenshots (section 5, same).
- [x] Mismatch list delivered — specific and actionable (section 6,
      20 numbered items grouped A–F).

---

## Suggested split into downstream issues

Rough mapping from section 6 → the remaining 12 cleanup tickets, so
ILI-715+ can be filed without re-doing this thinking:

- **ILI-715**  Pick canonical palette (#1, #2, #6 of section A).
- **ILI-716**  Pick canonical font roster + loading mechanism (#3, #4, #5).
- **ILI-717**  Pick canonical typography scaling rule (#6 of section A).
- **ILI-718**  Pick canonical border/rule mechanism (#7).
- **ILI-719**  Add per-article URLs `/blog/[slug]` (#8 first half).
- **ILI-720**  Add `/blog` index (#8 second half).
- **ILI-721**  Add `/rss.xml` (#9).
- **ILI-722**  Land the 5 missing article stubs (#10).
- **ILI-723**  Fix `robots.txt`, favicon, og:image (#11, #12, #13).
- **ILI-724**  Add code-block + tag patterns (#14, #15).
- **ILI-725**  Reconcile header / footer between layouts + add nav to
              design-system page (#17, #18, #19).
- **ILI-726**  Cleanup: `/tags/[tag]` if needed, button pattern, script
              extraction (#15 second half, #16, #20).

This split is a proposal, not a contract — the issue owner can
re-cut as they see fit.
