#!/usr/bin/env bash
# Stop any existing containers, rebuild, and run the dev server.
# Port 4321 will be bound to localhost. Open http://localhost:4321
set -e
cd "$(dirname "$0")"
echo "Stopping any existing containers..."
docker compose down 2>/dev/null || true
echo "Starting dev server (port 4321)..."
docker compose up --build dev
