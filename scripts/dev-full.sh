#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

run_php() {
  if command -v php >/dev/null 2>&1; then
    php "$@"
  elif command -v pkgx >/dev/null 2>&1; then
    pkgx php "$@"
  else
    echo "Error: php is not installed. Install php or pkgx first." >&2
    exit 1
  fi
}

cleanup() {
  if [ -n "${PHP_PID:-}" ]; then
    kill "$PHP_PID" >/dev/null 2>&1 || true
  fi
}

trap cleanup EXIT INT TERM

run_php artisan serve --host=127.0.0.1 --port=8000 >/tmp/atype-laravel.log 2>&1 &
PHP_PID=$!

echo "Laravel started on http://127.0.0.1:8000"
echo "Starting Vite dev server..."

pnpm dev --host 127.0.0.1 --port 5173
