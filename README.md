# A-Type (Laravel + TypeScript)

A-Type rewritten with Laravel 13 + TypeScript + pnpm.

## What’s Included

- Full login/signup flow
- Profile CRUD (read, update, delete account)
- Logout
- Typing game frontend in TypeScript
- `GET /home/words` endpoint
- `POST /home/typing` endpoint
- Leaderboard + info pages
- Seeded words list (`database/data/words.txt`)

## Quick Start

### 1. Install JS deps

```bash
pnpm install
```

### 2. Bootstrap backend + database + seed

```bash
pnpm bootstrap
```

`pnpm bootstrap` does:
- `.env` creation (if missing)
- `composer install` (uses local `composer` or `pkgx composer`)
- SQLite initialization
- app key generation
- fresh migrations + seed

### 3. Run app for full manual testing

```bash
pnpm dev:full
```

Then open: `http://127.0.0.1:8000`

## Verification

```bash
pnpm verify
```

This runs type-check, build, and Laravel tests.
