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

## Quick Start

### 1. Install and initialize

```bash
pnpm init:project
```

`pnpm init:project` will:

- create `.env` if missing
- enforce MySQL env defaults
- install Composer + pnpm dependencies
- run fresh migrations + seed

### 2. Run app

```bash
pnpm dev:full
```

Open: `http://127.0.0.1:8000`

## Verification

```bash
pnpm verify
```

This runs:

- TypeScript check
- Vite production build
- Laravel test suite (MySQL test DB)

## Docker (Dev-First)

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
