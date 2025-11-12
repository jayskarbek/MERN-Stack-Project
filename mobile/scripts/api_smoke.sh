#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-${API_BASE_URL:-http://localhost:5000/api}}"

echo "Using API base URL: $BASE_URL"
echo

function curl_json() {
  local method="$1"
  local url="$2"
  local data="${3:-}"

  if [[ -n "$data" ]]; then
    echo "# $method $url"
    echo "# payload: $data"
    curl -sS -X "$method" \
      -H 'Content-Type: application/json' \
      "$url" \
      -d "$data" | jq .
  } else {
    echo "# $method $url"
    curl -sS -X "$method" "$url" | jq .
  fi
  echo
}

curl_json GET "$BASE_URL/ping"
curl_json GET "$BASE_URL/parks?limit=3"

if [[ -n "${LOGIN_USERNAME:-}" && -n "${LOGIN_PASSWORD:-}" ]]; then
  curl_json POST "$BASE_URL/login" "{\"login\":\"$LOGIN_USERNAME\",\"password\":\"$LOGIN_PASSWORD\"}"
else
  echo "# Skipping /login smoke test (set LOGIN_USERNAME and LOGIN_PASSWORD env vars)."
  echo
fi
