#!/usr/bin/env bash
set -euo pipefail

if [[ -f ".env.local" ]]; then
  # Prisma validate requires DATABASE_URL in this project.
  set -a
  # shellcheck disable=SC1091
  source ".env.local"
  set +a
fi

echo "[prisma-sanity] Running prisma validate..."
bunx prisma validate

echo "[prisma-sanity] Running prisma generate..."
if [[ -f ".env.local" ]]; then
  bun run prisma-generate:local
else
  bunx prisma generate
fi

echo "[prisma-sanity] OK"
