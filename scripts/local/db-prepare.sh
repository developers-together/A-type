#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
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

if [ ! -f .env ]; then
  echo "Error: .env not found. Run 'pnpm local:bootstrap' first." >&2
  exit 1
fi

get_env_var() {
  local key="$1"
  grep -E "^${key}=" .env | head -n1 | cut -d'=' -f2-
}

DB_HOST="$(get_env_var DB_HOST)"
DB_PORT="$(get_env_var DB_PORT)"
DB_DATABASE="$(get_env_var DB_DATABASE)"
DB_USERNAME="$(get_env_var DB_USERNAME)"
DB_PASSWORD="$(get_env_var DB_PASSWORD)"

if command -v mysqladmin >/dev/null 2>&1; then
  if ! mysqladmin ping -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USERNAME" -p"$DB_PASSWORD" >/dev/null 2>&1; then
    echo "Error: MySQL is not reachable at ${DB_HOST}:${DB_PORT} for user '${DB_USERNAME}'." >&2
    exit 1
  fi
fi

if command -v mysql >/dev/null 2>&1; then
  mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USERNAME" -p"$DB_PASSWORD" \
    -e "CREATE DATABASE IF NOT EXISTS ${DB_DATABASE} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" || true

  mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USERNAME" -p"$DB_PASSWORD" \
    -e "CREATE DATABASE IF NOT EXISTS atype_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" || true
fi

run_php artisan migrate:fresh --seed --force --ansi

echo "Database prepared successfully."
