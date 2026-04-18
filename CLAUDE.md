## Workflow Rules

When you complete a task:
1. Commit all changes with a descriptive commit message
2. Push the branch
3. Open a PR against main with a summary of what changed
4. Update the linked Linear issue status to "In Review"

Do this automatically without being asked. Never leave work uncommitted.

## Design Direction — Prototype UX

The approved prototype is `has-design-prototype.html` at the repo root.
Read it completely before writing any code. It is the source of truth.

### Architecture
Single-page application. All views live in `src/pages/index.astro`.
Astro renders initial HTML server-side from the content collection.
Vanilla JS handles all state, transitions, and interactions client-side.
No Astro routing. No View Transitions API. No multi-page navigation.

### Views
- Grid: 2-column card layout, all articles
- Article: FLIP transition from card graphic to portrait article header
- About: full-page with field rows
- Contact: two-column form + Google Calendar scheduler

### Rules

…

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
- Tags should include `"HAS Design"` and `"Framework"` to group the series.
