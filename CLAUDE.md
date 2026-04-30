## Workflow Rules

When you complete a task:
1. Commit all changes with a descriptive commit message
2. Push the branch
3. Open a PR against main with a summary of what changed
4. Update the linked Linear issue status to "In Review"

Do this automatically without being asked. Never leave work uncommitted.

## Approved Prototype

The approved prototype is `has-design-prototype.html` at the repo root.
Read it completely before writing any code. It is the source of truth
for the Astro port milestone (ILI-665). Do not deviate. Do not introduce
new typography rules, new breakpoints, new layout strategies, or new
animations. Port this, exactly.

### Non-negotiables

- Typography: pure `vw` on desktop, pure `px` on mobile.
- No `rem` for font sizes. No `clamp()`. No `calc()` on font sizes.
- No `max-width` caps on content. Text fills its column.
- The only animation on the columns is `grid-template-columns` — no
  `translateX` slides between desktop states.
- Header: 80px static. Footer: 80px desktop / 60px mobile, static.
  Stage fills between via `grid-template-rows: 80px 1fr 80px`.
- Desktop default: `grid-template-columns: 70% 30% 0` (hero + list + hidden reader).
- Desktop article-open: `grid-template-columns: 80px calc(30% - 80px) 70%`
  (vertical back + list + reader).
- Mobile breakpoint: 900px. Below this, stage stacks single column and
  the article reader is a `position: fixed` full-screen overlay that
  slides in from the right.
- Escape key closes the article reader.

### Astro port notes

- Replace the prototype's inline `articles` array with
  `getCollection('articles')`; reader binds by the same DOM ids
  (`art-eyebrow`, `art-h1`, `art-lede`, `art-body`).
- `href="/"`, `href="/about"`, `href="/contact"` stay as real links.
  Only the article reader is client-rendered without navigation.
- Keep the `.brand-full` / `.brand-short` split intact.
- CSS lives in `src/styles/homepage.css` imported from a single
  `Homepage.astro` layout. No Tailwind. No CSS-in-JS. Class names verbatim.

## Content — Articles

`src/content/articles/` contains the HAS Design academic article series. These
are NOT the author's general-interest essays from Medium — those are explicitly
out of scope and must not be duplicated here.

- **Reference source** (not canonical — these are ideas, not finished work): the
  planning page "Article Series: Agentic Orchestration" at Notion ID
  `2cb70f3a-83ae-8120-a4ac-fe55f2923747` (parent: "HAS Design Framework"
  `2cb70f3a-83ae-818d-9d8b-e39c7ef762ab`). That page contains 6 article
  outlines, each with a hook, thesis, key points, payoff, and planned publish
  date.
- **Current article set** (6 stubs — expected to evolve as drafts are written;
  nothing here is canonical or final):
  1. `agents-arent-personas.md` — Dec 22, 2025
  2. `the-three-actors.md` — Dec 29, 2025
  3. `aci-agent-computer-interaction.md` — Jan 5, 2026
  4. `has-design-the-practice.md` — Jan 12, 2026
  5. `service-blueprints-for-agentic-orchestrations.md` — Jan 19, 2026
  6. `the-career-path-for-has-designers.md` — Jan 26, 2026
- The Notion page "HAS Design Blog — Articles"
  (`33f70f3a-83ae-811a-8641-fd227416d127`) is a list of the author's Medium
  essays and is **NOT** the source for this blog, despite its own description
  claiming otherwise. Do not fetch from it. If that description ever needs to
  be corrected, update it in Notion.
- Each stub's body is the outline content from the planning page (hook, thesis,
  key points, payoff) with a top note marking it as a stub. When a full draft
  is written, replace the stub body and keep the frontmatter `draft: false` so
  it continues to render.
- Use the outline's planned publish date for frontmatter `date`.
- `description` is the thesis statement from the outline.

## Content — Concepts and the framework

`src/content/concepts/` holds the 13 HAS-D concepts (5 Axioms · 4 Constraints
· 4 Design Requirements) that make up the framework's vocabulary. Each
concept renders at `/<category>/<slug>` through `src/pages/[category]/[slug].astro`
and lives in `src/lib/has-framework.ts`'s data layer.

- **Categories** are fixed at three: `axioms`, `constraints`, `design-requirements`.
  Defined in `src/content/categories/*.json` and `src/content/config.ts`. Don't
  add a fourth without explicit direction — the visual language (colour tokens,
  glyphs, badge pips) is built around three.
- **Member counts are derived**, never hardcoded. `getCategoryBySlug()` and
  `getAllCategoriesWithMembers()` count concepts per category at build time.
  When you add or remove a concept, the hub page count, framework locator
  count, and concept eyebrow `01 / 04` index update automatically.
- **`category_index`** must be unique within a category. Build-time validator
  (`scripts/validate-framework.mjs`) flags duplicates.

### Frontmatter references and the framework affordance bar

Two places use a `references: [conceptSlug, ...]` field, both validated at
build time:

- **Concept frontmatter** declares the concepts this concept depends on.
  Drives `getReferencedBy()` for the inverse "Referenced by" footer on
  concept pages — no manual back-linking. Example:
  `references: [mirroring]` on `gradient-descent.mdx` causes Mirroring's
  page to list Gradient Descent under Referenced by.
- **Article frontmatter** declares which concepts the article connects to.
  When non-empty, the article reader injects the framework affordance bar
  (locator) between the rule and the body. Empty/absent → no bar. The
  freeform `tags` field is gone; the bar conveys the framework connection
  implicitly.

Both kinds of `references` resolve against existing concept slugs. A typo or
removed concept fails `npm run build` via the validator at
`scripts/validate-framework.mjs`. The validator runs on every build and via
`npm run check`; do not skip it.

### Inline cross-references in MDX bodies

Concept and article bodies should link to other concepts via `<ConceptLink>`,
not raw `<a>`. The component picks up the destination's category colour for
the underline (the cross-hub link pattern). Example:

```mdx
import ConceptLink from '../../components/ConceptLink.astro';

This pairs with <ConceptLink slug="mirroring">Mirroring</ConceptLink>: …
```

Slugs are validated at build time — `<ConceptLink slug="typo">` fails the build.

## Engineering gotchas (MDX + Astro)

Two non-obvious pitfalls when mounting Astro components inside MDX bodies:

1. **Indented markdown inside JSX `<p class="...">` splits into sibling
   paragraphs.** MDX parses
   `<p class="x">\n  Some text.\n</p>` as `<p class="x"></p><p>Some text.</p>` —
   the class lands on an empty `<p>` and the prose escapes. Collapse the inner
   content onto a single line.
2. **Component-scoped `<style>` blocks don't load on pages that reach the
   component only via content-collection rendering.** Astro tracks scoped CSS
   dependencies through static `import` statements in page modules. If a
   page renders a component only through `await render(article)` of an MDX
   entry that imports it, the scoped stylesheet isn't linked. Extract the
   structural CSS to `src/styles/<component>.css` and import it from
   `HomepageLayout.astro`. Components currently using this pattern:
   `FrameworkLocator`, `ConceptLink`.
