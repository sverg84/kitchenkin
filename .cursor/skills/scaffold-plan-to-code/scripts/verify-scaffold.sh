#!/usr/bin/env bash
set -euo pipefail

RUN_BUILD=false
if [[ "${1:-}" == "--with-build" ]]; then
  RUN_BUILD=true
fi

echo "[verify-scaffold] Running lint..."
bun run lint

echo "[verify-scaffold] Running typecheck..."
bunx tsc --noEmit

if [[ "${RUN_BUILD}" == true ]]; then
  echo "[verify-scaffold] Running build..."
  bun run build
fi

echo "[verify-scaffold] OK"
