# A-Type (Laravel + Inertia React + TypeScript + Tailwind)

A-Type is a Laravel 13 monolith using Inertia React, TypeScript, Tailwind, and MySQL.

## What’s Included

- React/TypeScript pages for home, login/signup, profile, leaderboard, and info
- Laravel session authentication (login/register/logout)
- Profile CRUD + profile notes full CRUD
- Typing game with JSON endpoints
- Theme persistence for authenticated users
- Seeded words list (`database/data/words.txt`)

## Prerequisites

- PHP 8.3+
- Composer
- Node.js 20+
- pnpm
- MySQL 8+

Create MySQL databases:

- `atype`
- `atype_test`

with credentials matching `.env.example` (or update env vars).

## Quick Start (No Docker)

### 1. Install and initialize

```bash
pnpm local:bootstrap
```

`pnpm local:bootstrap` will:

- create `.env` if missing
- set MySQL env defaults only if missing (keeps your existing local DB creds)
- install Composer + pnpm dependencies
- generate app key
- run migrations + seed if MySQL is reachable

If MySQL is not running yet, bootstrap still succeeds and prints the next step:

```bash
pnpm local:db:prepare
```

### 2. Run app

```bash
pnpm local:up
```

Open: `http://127.0.0.1:8000`

Compatibility aliases:

- `pnpm init:project` -> `pnpm local:bootstrap`
- `pnpm dev:full` -> `pnpm local:up`

## Verification

```bash
pnpm verify
```

This runs:

- TypeScript check
- Vite production build
- Laravel test suite (MySQL test DB)

## Docker (Dev-First, Existing Way)

Use the included Docker Compose stack (`app + mysql + vite`):

```bash
pnpm docker:bootstrap
pnpm docker:up
```

Useful commands:

- `pnpm docker:logs`
- `pnpm docker:test`
- `pnpm docker:seed`
- `pnpm docker:down`
