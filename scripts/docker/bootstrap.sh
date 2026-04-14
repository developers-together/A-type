#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

if [ ! -f .env ]; then
  cp .env.example .env
fi

docker compose up -d mysql

echo "Waiting for MySQL to become healthy..."
docker compose ps

until [ "$(docker inspect --format='{{json .State.Health.Status}}' atype-mysql 2>/dev/null || echo '"starting"')" = '"healthy"' ]; do
  sleep 2
done

docker compose run --rm app bash -lc "composer install && pnpm install && php artisan key:generate --force && php artisan migrate:fresh --seed --force"

echo "Bootstrap finished."
echo "Run: scripts/docker/up.sh"
