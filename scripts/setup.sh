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

run_composer() {
  if command -v composer >/dev/null 2>&1; then
    composer "$@"
  elif command -v pkgx >/dev/null 2>&1; then
    pkgx composer "$@"
  else
    echo "Error: composer is not installed. Install composer or pkgx first." >&2
    exit 1
  fi
}

if [ ! -f .env ]; then
  cp .env.example .env
fi

run_composer install --no-interaction --prefer-dist
mkdir -p database
: > database/database.sqlite
run_php artisan key:generate --force --ansi
run_php artisan migrate:fresh --seed --force --ansi
pnpm install

echo "Setup complete."
echo "Next: run 'pnpm dev:full' and open http://127.0.0.1:8000"
