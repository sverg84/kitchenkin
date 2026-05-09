#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"

if [[ -f "${ROOT_DIR}/.env.local" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "${ROOT_DIR}/.env.local"
  set +a
fi

echo "[graphql-contract-check] Dumping schema..."
bun "${ROOT_DIR}/.cursor/skills/backend-graphql-feature-design/scripts/dump-graphql-schema.ts" --out ".tmp/schema.graphql"

echo "[graphql-contract-check] Running graphql-codegen with local schema..."
bunx graphql-codegen --config "${ROOT_DIR}/codegen.local.yml"

echo "[graphql-contract-check] OK"
