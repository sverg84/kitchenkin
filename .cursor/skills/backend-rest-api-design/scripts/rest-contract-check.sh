#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
BASE_URL="${REST_CONTRACT_BASE_URL:-http://127.0.0.1:3000}"

echo "[rest-contract-check] GET ${BASE_URL}/api/recipes?first=1"
curl -fsS "${BASE_URL}/api/recipes?first=1" | head -c 200
echo ""
echo "[rest-contract-check] GET ${BASE_URL}/api/categories?first=1"
curl -fsS "${BASE_URL}/api/categories?first=1" | head -c 200
echo ""
echo "[rest-contract-check] OK"
