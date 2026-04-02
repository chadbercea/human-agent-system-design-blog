# human-agent-system-design-blog

HAS Design blog (Human–Agent–System Design): **direction and Definition of Done live in Linear**, not in this README.

**[CLAUDE.md — HAS Design Blog Agent Briefing](https://linear.app/iliketobuild/document/claudemd-has-design-blog-agent-briefing-5f16dbea3f75)** — source of truth for stack, routes, CSS architecture, and what to remove (e.g. Three.js / diorama). Work issues in **HAS-D Blog** from **ILI-561** onward.

## Setup

```bash
npm install
```

## Dev

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Check

```bash
npm run check
```

## Deploy

**Vercel** builds from GitHub. Production branch: **`main`**. Static output is `dist/` (see `vercel.json`).

## Docker (optional)

Docker Compose is available for local dev if you prefer containers; it is **not** required.

**Dev (live reload):**

```bash
./run-dev.sh
```

Or: `docker compose up --build dev` — then http://localhost:4321

**Production preview in container:**

```bash
docker compose up --build prod
```
