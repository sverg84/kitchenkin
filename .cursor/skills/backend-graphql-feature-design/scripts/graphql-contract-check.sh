#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
cd "${ROOT_DIR}"

if [[ -f "${ROOT_DIR}/apps/web/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "${ROOT_DIR}/apps/web/.env"
  set +a
fi

SCHEMA_OUT="${ROOT_DIR}/packages/graphql/.tmp/schema.graphql"
mkdir -p "$(dirname "${SCHEMA_OUT}")"

ENV_FILE="${ROOT_DIR}/apps/web/.env"
DUMP_CMD=(bun)
if [[ -f "${ENV_FILE}" ]]; then
  DUMP_CMD=(bun --env-file="${ENV_FILE}")
fi

echo "[graphql-contract-check] Dumping schema from packages/api Pothos builder..."
"${DUMP_CMD[@]}" "${ROOT_DIR}/.cursor/skills/backend-graphql-feature-design/scripts/dump-graphql-schema.ts" --out "packages/graphql/.tmp/schema.graphql"

echo "[graphql-contract-check] Running graphql-codegen (packages/graphql)..."
(cd "${ROOT_DIR}/packages/graphql" && bunx graphql-codegen --config codegen.local.yml)

echo "[graphql-contract-check] OK"
