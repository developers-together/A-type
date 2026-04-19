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
  awk -F= -v key="$key" '$1 == key { print substr($0, index($0, "=") + 1); exit }' .env
}

resolve_sqlite_db_path() {
  local configured_path="$1"

  if [ -z "$configured_path" ]; then
    echo "${ROOT_DIR}/database/database.sqlite"
    return
  fi

  if [ "$configured_path" = ":memory:" ]; then
    echo ":memory:"
    return
  fi

  case "$configured_path" in
    /*) echo "$configured_path" ;;
    *) echo "${ROOT_DIR}/${configured_path}" ;;
  esac
}

load_words_into_sqlite_cli() {
  local sqlite_db_path="$1"
  local words_file="${ROOT_DIR}/database/data/words.txt"

  if ! command -v sqlite3 >/dev/null 2>&1; then
    echo "Error: sqlite3 CLI is required for SQLite fallback seeding." >&2
    exit 1
  fi

  if [ "$sqlite_db_path" = ":memory:" ]; then
    echo "Error: Cannot seed ':memory:' SQLite database from this script." >&2
    exit 1
  fi

  mkdir -p "$(dirname "$sqlite_db_path")"
  touch "$sqlite_db_path"

  sqlite3 "$sqlite_db_path" <<'SQL'
CREATE TABLE IF NOT EXISTS words (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  word VARCHAR NOT NULL UNIQUE,
  created_at DATETIME NULL,
  updated_at DATETIME NULL
);
SQL

  local timestamp
  timestamp="$(date '+%Y-%m-%d %H:%M:%S')"

  {
    echo "BEGIN;"
    tr -s '[:space:]' '\n' < "$words_file" \
      | tr '[:upper:]' '[:lower:]' \
      | sed '/^$/d' \
      | sort -u \
      | sed "s/'/''/g; s/.*/INSERT OR IGNORE INTO words (word, created_at, updated_at) VALUES ('&', '${timestamp}', '${timestamp}');/"
    echo "COMMIT;"
  } | sqlite3 "$sqlite_db_path"
}

DB_CONNECTION="$(get_env_var DB_CONNECTION)"
DB_HOST="$(get_env_var DB_HOST)"
DB_PORT="$(get_env_var DB_PORT)"
DB_DATABASE="$(get_env_var DB_DATABASE)"
DB_USERNAME="$(get_env_var DB_USERNAME)"
DB_PASSWORD="$(get_env_var DB_PASSWORD)"
DB_CONNECTION="${DB_CONNECTION:-mysql}"

if [ "$DB_CONNECTION" = "sqlite" ]; then
  SQLITE_DB_PATH="$(resolve_sqlite_db_path "$DB_DATABASE")"
  SQLITE_PDO_READY=false

  if run_php -r "exit(extension_loaded('pdo_sqlite') ? 0 : 1);"; then
    SQLITE_PDO_READY=true
  fi

  if [ "$SQLITE_PDO_READY" = true ]; then
    if run_php artisan migrate:fresh --seed --force --ansi; then
      echo "SQLite database prepared successfully."
      exit 0
    fi

    echo "Warning: Laravel SQLite migrate/seed failed. Falling back to sqlite3 word import." >&2
  else
    echo "Warning: PHP pdo_sqlite is not enabled. Falling back to sqlite3 word import." >&2
  fi

  load_words_into_sqlite_cli "$SQLITE_DB_PATH"

  WORD_COUNT="$(sqlite3 "$SQLITE_DB_PATH" "SELECT COUNT(*) FROM words;")"
  echo "SQLite words loaded successfully (${WORD_COUNT} rows)."
  exit 0
fi

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
