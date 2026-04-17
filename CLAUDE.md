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

## Content Sync — Articles

`src/content/articles/` is synced manually from Notion via MCP. There is no
automated sync script. When syncing:

- **Canonical source:** parent page `33f70f3a-83ae-811a-8641-fd227416d127`
  ("HAS Design Blog — Articles"). Fetch the parent, then iterate its child
  pages only.
- **Do NOT use workspace search** (`notion-search`) to find articles. It pulls
  in unrelated content. The parent page itself says: "fetch all child pages of
  this page to get the full article list. Do not search the workspace."
- **Canonical article set** (6 pages — exactly these, no more, no less):
  - `30d70f3a-83ae-8102-8e7b-de538564c60a` — Why HCI Needs a Child
  - `30c70f3a-83ae-811e-a0ee-d4aded9e4dce` — There Is No Exodus
  - `33470f3a-83ae-8134-a4a3-e166d5090008` — The ROI You're Chasing
  - `2c670f3a-83ae-809d-ac71-dc50a0285c2a` — Design's Seat At The Table
  - `32b70f3a-83ae-8171-9753-ca8d34dad040` — Wait, You Guys Actually Killed Design
  - `33370f3a-83ae-8063-a00d-f45795457f44` — AI Title Doesn't Mean You Know AI
- Strip `DRAFT:` prefix and leading emoji/icons from titles. When the Notion
  title starts with `DRAFT:`, set `draft: true` in the Markdown frontmatter
  so the article is excluded from the rendered list (see
  `src/pages/index.astro` filter on `!data.draft`).
- Strip Notion artifacts: `📷 HERO/IMAGE` photo-direction blocks, `<file>` tags,
  `<empty-block/>`, and any "Exported from … exported_from_atlassian_cloud"
  footer lines.
- Use the Notion page's last-edited timestamp for frontmatter `date`.
- `description` is the first substantive sentence of the body.
