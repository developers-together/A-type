# A-Type (With Frameworks)

Laravel + TypeScript rewrite of A-Type with pnpm + Vite.

## Stack

- Backend: Laravel 13 (PHP 8.5)
- Frontend: TypeScript modules bundled with Vite
- Package manager: pnpm
- Database: SQLite by default (easy local run)

## Implemented

- Typing home page with the original game flow
- Words API (`GET /home/words?amount=...`)
- Typing session save API (`POST /home/typing`)
- Auth + account CRUD
- Register
- Login
- Read profile/stats
- Update profile (username/email/password)
- Delete account
- Logout
- Leaderboard (all-time + daily)
- Words seed loader from `database/data/words.txt`

## Run Locally

1. Install PHP/composer if missing (or use `pkgx`):

```bash
pkgx php -v
pkgx composer --version
```

2. Install dependencies:

```bash
pkgx composer install
pnpm install --ignore-workspace
```

3. Prepare DB + seed words:

```bash
pkgx php artisan migrate:fresh --seed
```

4. Start app:

```bash
pkgx php artisan serve
pnpm dev
```

## Validation / Tests

```bash
pnpm typecheck
pnpm build
pkgx php artisan test
```

All of the above pass on this branch.
