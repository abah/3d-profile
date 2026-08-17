#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${CLOUDFLARE_API_TOKEN:-}" ]]; then
  echo "CLOUDFLARE_API_TOKEN belum ada — deploy ditunda."
  exit 1
fi

cd "$(dirname "$0")/.."
npx wrangler pages deploy . --project-name=indonesia-81 --commit-dirty=true
echo "Live: https://indonesia-81.pages.dev/hutri81"
