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

set_env_default() {
  local key="$1"
  local value="$2"

  if grep -q "^${key}=" .env; then
    local current
    current="$(grep -E "^${key}=" .env | head -n1 | cut -d'=' -f2-)"
    if [ -z "${current}" ]; then
      perl -i -pe "s/^${key}=.*/${key}=${value}/g" .env
    fi
  else
    echo "${key}=${value}" >> .env
  fi
}

get_env_var() {
  local key="$1"
  grep -E "^${key}=" .env | head -n1 | cut -d'=' -f2-
}

if [ ! -f .env ]; then
  cp .env.example .env
fi

# Keep local customization intact: set defaults only when missing/empty.
set_env_default "DB_CONNECTION" "mysql"
set_env_default "DB_HOST" "127.0.0.1"
set_env_default "DB_PORT" "3306"
set_env_default "DB_DATABASE" "atype"
set_env_default "DB_USERNAME" "atype"
set_env_default "DB_PASSWORD" "atype"

DB_HOST="$(get_env_var DB_HOST)"
DB_PORT="$(get_env_var DB_PORT)"
DB_DATABASE="$(get_env_var DB_DATABASE)"
DB_USERNAME="$(get_env_var DB_USERNAME)"
DB_PASSWORD="$(get_env_var DB_PASSWORD)"

run_composer install --no-interaction --prefer-dist
pnpm install
run_php artisan key:generate --force --ansi

DB_READY=false
if command -v mysqladmin >/dev/null 2>&1; then
  if mysqladmin ping -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USERNAME" -p"$DB_PASSWORD" >/dev/null 2>&1; then
    DB_READY=true
  fi
fi

if [ "$DB_READY" = true ] && command -v mysql >/dev/null 2>&1; then
  mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USERNAME" -p"$DB_PASSWORD" \
    -e "CREATE DATABASE IF NOT EXISTS ${DB_DATABASE} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" || true

  mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USERNAME" -p"$DB_PASSWORD" \
    -e "CREATE DATABASE IF NOT EXISTS atype_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" || true
fi

if [ "$DB_READY" = true ]; then
  run_php artisan migrate:fresh --seed --force --ansi
  echo "Local setup complete with database migrations."
else
  echo "Warning: MySQL is not reachable at ${DB_HOST}:${DB_PORT} for user '${DB_USERNAME}'." >&2
  echo "Local setup completed without DB migrations." >&2
  echo "When MySQL is up, run: pnpm local:db:prepare" >&2
fi

echo "Run: pnpm local:up"
echo "Then open: http://127.0.0.1:8000"
