# A-Type (Laravel + React + TypeScript + Tailwind)

A-Type framework edition on branch `With-Frameworks`.

## Stack

- Backend: Laravel 13 (PHP 8.3+)
- Frontend: React 19 + TypeScript
- UI: Tailwind CSS (token-based light/dark theming)
- Database runtime: MySQL
- Package manager: pnpm

## Features

- Full auth flow (signup/login/logout)
- Profile settings CRUD
- Profile picture upload/remove
- Quick notes CRUD with thought-bubble preview (profile + navbar)
- Remove-all-data profile action
- Typing sessions + leaderboard
- React-rendered pages with shared embedded navbar
- Bottom-right toast notifications

## Quick Start

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure MySQL

Set `.env` values:

```bash
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=atype
DB_USERNAME=root
DB_PASSWORD=
```

### 3. Initialize app

```bash
pnpm init:project
```

### 4. Run app

```bash
pnpm dev:full
```

Open: `http://127.0.0.1:8000`

## Verification

```bash
pnpm verify
```

Runs TypeScript typecheck, Vite build, and Laravel tests.
