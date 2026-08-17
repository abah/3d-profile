#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${CLOUDFLARE_API_TOKEN:-}" ]]; then
  echo "CLOUDFLARE_API_TOKEN belum ada — deploy ditunda."
  exit 1
fi

cd "$(dirname "$0")/.."
npx wrangler pages deploy . --project-name=indonesia-81 --commit-dirty=true
echo ""
echo "Pages:  https://indonesia-81.pages.dev/hutri81"
echo "Domain: https://hutri81.abah.me  (setelah custom domain di CF Dashboard)"
