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
