# Agent instructions

Repo-level guidance for any agent working in this codebase. Pairs with
`CLAUDE.md` (which carries the larger architectural notes) — both files are
authoritative; do not let them drift apart.

## Articles — tagging is required

Every new article in `src/content/articles/` must declare a `category` in
its frontmatter. The category files an article under one of the three
framework hubs and drives the visible tag UI on both the article card and
inside the article reader.

```yaml
---
title: "..."
date: 2026-05-01
postNumber: N
category: axioms          # one of: axioms | constraints | design-requirements
references:
  - <concept-slug>        # optional, drives the framework affordance bar at the bottom of the reader
---
```

### Checks before merging an article PR

1. **`category` is set** to one of `axioms`, `constraints`, `design-requirements`. The schema in
   `src/content/config.ts` accepts `undefined`, but a published article without a category renders
   without a tag — that is a content bug, not an intended state.
2. **The tag renders** in two places. Open the article in the reader and confirm:
   - The `<CategoryBadge>` pill appears in the post card footer (`PostCard.astro`).
   - The same `<CategoryBadge>` pill appears in the reader, below the title + lede, above the rule.
3. **No invented tag markup.** Tags are rendered via `<CategoryBadge>` only.
   Do not introduce parallel "TAG <name>" plain-text treatments — the
   pre-approved visual style is the badge component (rounded pill with
   sibling glyphs, color-coded by category). See `src/components/CategoryBadge.astro`.
4. **Run `npm run check` and `npm run build`** before opening the PR. The
   framework validator at `scripts/validate-framework.mjs` rejects orphan
   `references:` entries.

## Components — reuse first, invent last

Before introducing new markup for a visual primitive (badge, chip, pill,
locator, eyebrow, footer block), check `src/components/` and the
`/design-system` page. Components like `<CategoryBadge>`, `<CategoryGlyph>`,
`<FrameworkLocator>`, `<ConceptLink>` already exist with the approved
treatment. Slotting an existing component into a placement hook is preferred
over writing parallel CSS.
