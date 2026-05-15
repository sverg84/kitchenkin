#!/usr/bin/env bash
# Vercel-only: replaces src/*.ts with a stub that re-exports src/app.bundle.js.
# Do not run locally with VERCEL=1 unless you will restore src/ from git afterward.
set -euo pipefail

cd "$(dirname "$0")/.."

bun run --filter @kk/db prisma:generate
bun build ./src/index.ts --outfile ./src/app.bundle.js --target bun --bundle

if [[ -n "${VERCEL:-}" ]]; then
  rm -f index.js
  find src -name '*.ts' -delete
  cat > src/index.ts <<'EOF'
import { Hono } from "hono";
void Hono;
export { default } from "./app.bundle.js";
EOF
fi
