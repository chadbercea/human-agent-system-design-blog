# human-agent-system-design-blog

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

Deploy the `dist` output to Vercel (default Astro adapter; no config required).

## Docker

Everything runs inside Docker (Node 20). **Do not run npm/node on the host** for this project.

**Run the blog (dev, live reload):**

```bash
./run-dev.sh
```

Or manually:

```bash
docker compose down
docker compose up --build dev
```

Then open **http://localhost:4321** in your browser. The container must stay running (foreground); you should see `Local http://localhost:4321/` in the logs. Port **4321** is mapped host:container.

**Production (build + preview):**

```bash
docker compose up --build prod
```

Open http://localhost:4321
