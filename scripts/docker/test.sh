#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

docker compose up -d mysql

until [ "$(docker inspect --format='{{json .State.Health.Status}}' atype-mysql 2>/dev/null || echo '"starting"')" = '"healthy"' ]; do
  sleep 2
done

docker compose run --rm \
  -e APP_ENV=testing \
  -e DB_CONNECTION=mysql \
  -e DB_HOST=mysql \
  -e DB_PORT=3306 \
  -e DB_DATABASE=atype_test \
  -e DB_USERNAME=atype \
  -e DB_PASSWORD=atype \
  app bash -lc "php artisan test"
