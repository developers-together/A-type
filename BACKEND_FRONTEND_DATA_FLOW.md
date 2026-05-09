# Backend ↔ Frontend Data Flow (Custom MVC)

This document describes, at implementation level, how the current custom PHP MVC backend exchanges data with the frontend in A-Type.

Last verified against `master` through commit `59aa72f` (May 8, 2026).

Scope:
- Runtime request path from browser to controller/model/view.
- JSON endpoints consumed by frontend JS modules.
- HTML form endpoints used by auth/profile flows.
- Session/cookie coupling.
- Database write/read mapping for frontend-visible features.
- Current contract gaps and edge cases frontend engineers must account for.

---

## 1) Request Lifecycle in the Custom MVC Stack

### 1.1 Entry path and URL rewriting

1. Browser sends request to Apache DocumentRoot (`Public/`).
2. `Public/.htaccess` rewrites non-file/non-directory paths to:
   - `index.php?url=<requested-path>`
3. `Public/index.php` autoloads classes under the `App\\` namespace and instantiates `App\\Core\\App`.

Key implementation files:
- `Public/.htaccess`
- `Public/index.php`
- `App/Core/App.php`

### 1.2 Router/controller/method resolution

`App\\Core\\App::__construct()` performs:

1. `session_start()` on **every request**.
2. Parse route via `parseUrl()`:
   - If `$_GET['url']` exists: split by `/`.
   - Else defaults to `['Home', 'index']`.
3. Controller resolution:
   - First segment maps to `\\App\\Controllers\\<Ucfirst(segment)>`.
   - Default controller is `App\\Controllers\\Home`.
4. Method resolution:
   - Second segment maps to method if present.
   - Default method is `index`.
5. Remaining segments become positional params (`call_user_func_array`).

### 1.3 Rendering mode decisions

Controller methods return data in 2 patterns:

1. **Server-rendered HTML view**
   - Uses `$this->view('<view_name>', $data)`.
   - View pulls data directly from `$data` array.
2. **JSON response**
   - `echo json_encode(...)` directly in controller.
   - Used by `/home/words` and `/home/typing`.

No central response abstraction, no global middleware chain beyond session initialization.

---

## 2) Frontend Integration Surface (What the Frontend Actually Calls)

There are only two JS `fetch` APIs currently:

1. `GET /home/words?amount=<n>`
2. `POST /home/typing`

Everything else is standard HTML navigation/forms:

- `POST /Profile/login`
- `POST /Profile/register`
- `POST /Profile/logout`
- `GET /Profile/delete` (currently triggered from profile danger-zone form)
- `GET /Profile`
- `GET /Leaderboard?filter=all_time|daily`
- `GET /Info`
- `GET /Home`

---

## 3) Endpoint Contracts (Detailed)

## 3.1 `GET /home/words?amount=<n>`

Purpose:
- Returns random words from DB for typing test generation.

Called by:
- `Public/js/modules/ui.js` → `renderWords(wordNum)`.

Transport:
- Method: `GET`
- Query params: `amount` (int coercion server-side)
- Auth required: No
- Response type: JSON (`Content-Type: application/json` set)

Server logic (`Home::words`):
- `amount` defaults to `15` if missing.
- Fast-path "valid set" is currently `[10, 25, 50, 100]` (word-mode presets).
- Any other value falls back to `min(amount, 200)` (so `15/30/60/90/120` still work).
- Model query: `SELECT word FROM words ORDER BY RAND() LIMIT :amount`.

Response schema:
```json
[
  { "word": "example" },
  { "word": "typing" }
]
```

Frontend assumptions:
- Expects array of objects with `.word` property.
- Adds punctuation/numbers on client side after receive.

Failure characteristics:
- No explicit validation error payload.
- On backend exception, frontend `catch` logs error and continues (no user-facing fallback message).

---

## 3.2 `POST /home/typing`

Purpose:
- Persist a finished typing session.

Called by:
- `Public/js/modules/stats.js` → `sendData(...)` after result screen is shown.

Transport:
- Method: `POST`
- Content-Type: `application/x-www-form-urlencoded`
- Body encoding: `URLSearchParams`
- Cookies/session: `credentials: "include"` is set in fetch
- Auth required: Yes (`$_SESSION['user_id']`)

Expected request body fields:
- `wpm` (number)
- `accuracy` (number)
- `mode` (`"time"` or `"words"`)
- `amount` (time seconds or word count)
- `punctuation` (`0|1` from class toggle)
- `numbers` (`0|1` from class toggle)

Unauthenticated response:
- HTTP `401`
- Body:
```json
{ "status": "error", "message": "User not logged in" }
```

Authenticated success response:
- HTTP `200`
- Body:
```json
{ "status": "success" }
```

Persistence mapping:
- Controller builds `$data` directly from `$_POST` and session user id.
- Model `Typing::insert($data)` writes to `typing_sessions`.

Important behavior notes:
- No explicit backend input validation/sanitization in controller.
- No explicit `Content-Type: application/json` header for this response (body is JSON anyway).
- Frontend treats non-2xx as error; parses body as JSON on success path.

---

## 3.3 Auth/profile actions (`/Profile/login`, `/Profile/register`, `/Profile/logout`, `/Profile/delete`)

These are full-page form submissions, not XHR/fetch APIs.

### Register: `POST /Profile/register`

Input from form:
- `username`, `email`, `password`, `verify_password`.

Backend behavior:
- Reads `username`, `email`, `password`.
- Hashes with `password_hash(PASSWORD_DEFAULT)`.
- Inserts into `users` (`username`, `email`, `password_hash`).
- Sets `$_SESSION['user_id']` to inserted id.
- Renders `home` view.

Integration note:
- `verify_password` is present in UI but currently not validated server-side.

### Login: `POST /Profile/login`

Input from form:
- `email`, `password`.

Backend behavior:
- Queries user by email.
- Verifies password via `password_verify`.
- On success: sets session and renders profile view.
- On failure: renders login view again.

### Logout: `POST /Profile/logout`

Backend behavior:
- `unset($_SESSION['user_id'])`
- Renders home view.

### Delete account: `GET /Profile/delete`

Triggered by:
- Profile danger-zone delete form (`action="/Profile/delete"`).

Backend behavior:
- If `$_SESSION['user_id']` exists:
  - Deletes user row via `User::delete(id)`.
  - DB cascade removes related `typing_sessions` rows (`ON DELETE CASCADE`).
  - Unsets session and renders home view.
- If session user id is missing:
  - Method returns without rendering a fallback view/JSON payload.

---

## 3.4 Read endpoints used for page rendering

### `GET /Profile`

If authenticated:
- Loads `User::get(user_id)`.
- Loads `Typing::getBestScores(user_id)`.
- Loads `Typing::avg(user_id)`.
- Profile view currently renders aggregate cards from `avg` (`total_tests`, `avg_wpm`, `avg_acc`, `best_wpm`, `best_acc`).
- The mode+amount best-scores table is currently disabled in the view (`if (false)` guard), although backend data is still fetched.
- Renders `profile` view with `$data`.

If not authenticated:
- Renders `login` view.

### `GET /Leaderboard?filter=all_time|daily`

Backend:
- Reads `filter` query param (`all_time` default).
- `Typing::leaderboard(filter)` returns:
  - `time` list
  - `words` list
- Renders `leaderboard` view.

### `GET /Info`
- Renders static info view.

---

## 4) Session and Identity Coupling

Session lifecycle:
- Session starts in `App\\Core\\App` constructor before routing.

How frontend becomes authenticated:
1. Submit login/register form.
2. Backend sets `$_SESSION['user_id']`.
3. Browser receives session cookie.
4. Subsequent requests include cookie automatically.

Where auth state affects frontend:
- Navbar profile icon switches style by `isset($_SESSION['user_id'])`.
- `/Profile` route serves either profile dashboard or login page.
- `/home/typing` rejects unauthenticated users with HTTP 401 JSON.

---

## 5) Data Model Mapping Relevant to Frontend

## 5.1 `users`
Fields used by frontend flows:
- `id` (session identity)
- `username` (displayed on profile and leaderboard join)
- `email` (login credential)
- `password_hash` (never exposed to frontend)

## 5.2 `words`
- Source for text generation API (`/home/words`).
- Only `word` is returned to frontend.

## 5.3 `typing_sessions`
Fields written from frontend gameplay:
- `user_id`
- `wpm`
- `accuracy`
- `mode`
- `amount`
- `numbers`
- `punctuation`
- `session_at` auto timestamp

Fields read back into frontend-rendered pages:
- Profile aggregate cards (`avg_acc`, `avg_wpm`, `best_wpm`, `best_acc`, `total_tests`)
- Profile best-by-mode data (`mode`, `amount`, `wpm`, `accuracy`) is still queried but not currently rendered in active UI
- Leaderboard (`username`, `wpm`, `accuracy`, `session_at`, mode-specific filtering)

---

## 6) Frontend Runtime Sequence (Gameplay to Persistence)

Normal happy-path sequence:

1. Home page loads, JS modules initialize (`scripts.js`).
2. `newGame()` triggers `renderWords(...)`.
3. `renderWords` calls `/home/words` and hydrates DOM word spans.
4. User types; stats computed in-browser (`calculateMetrics`).
5. End of test shows stats screen.
6. `sendData(...)` posts metrics to `/home/typing`.
7. Backend inserts row into `typing_sessions`.
8. Future `/Profile` and `/Leaderboard` renders include persisted results.

---

## 7) Current Contract Gaps / Edge Cases (Important for Frontend Engineers)

1. JSON header inconsistency on `/home/typing`:
- Returns JSON body but does not explicitly set `Content-Type: application/json`.
- Current frontend still works because `response.json()` parses payload body.

2. Limited server-side validation:
- No strict validation of numeric ranges/types for `wpm`, `accuracy`, `amount`, flags.
- Frontend should treat this API as permissive today, but not rely on that long-term.

3. Auth failure only for save endpoint:
- `/home/typing` fails with 401 when user not logged in.
- Frontend currently logs error only; no user prompt/redirect.

4. `typing_sessions.amount` schema mismatch risk:
- Latest DB schema now includes both word and time presets:
  - `ENUM('10','15','25','30','50','60','100','120')`.
- Existing environments that did not apply the updated migration may still drift.

5. Profile aggregate semantic mismatch:
- `Typing::avg` fields `total_words` and `total_time` are currently counts of sessions by mode, not literal words/time units.
- These cards are currently hidden in `profile.php` (`if (false)`), but values remain semantically non-literal if re-enabled.

6. Leaderboard mode/amount hardcoding:
- Query is intentionally hardcoded to benchmark buckets:
  - `time + amount=15`
  - `words + amount=10`
- UI should keep labels aligned with these backend constants unless query logic is expanded.

7. Register form parity gap:
- `verify_password` exists in UI but backend ignores it.
- Frontend-side validation is currently the only guard.

8. Destructive action routed through GET:
- Profile delete form uses `method="delete"` (not a standard HTML form method), so browsers effectively submit GET.
- Account deletion is therefore currently reachable through a GET route and has no CSRF protection.

---

## 8) Practical Integration Guidance for Frontend Work

1. Treat `/home/words` as the stable read API:
- Response shape is `Array<{ word: string }>`.
- Always guard against empty arrays/network failures.

2. Treat `/home/typing` as session-dependent write API:
- Expect 401 when unauthenticated.
- Add UX fallback (prompt login or banner) instead of console-only error handling.

3. Keep payload format as form-encoded for compatibility:
- Backend reads `$_POST` directly.
- Sending JSON body will currently break without backend parsing changes.

4. If introducing new filters or game modes:
- Coordinate route/controller/model/schema updates together.
- Current stack has no API versioning or compatibility layer.

5. When consuming profile/leaderboard numbers:
- Understand they are server-rendered snapshots, not live JSON APIs.
- Any frontend SPA migration will require extracting new JSON endpoints.

---

## 9) Suggested Future API Hardening (for joint frontend/backend planning)

1. Set explicit response headers for all JSON endpoints.
2. Add request validation and structured error payloads.
3. Validate `mode`/`amount` combinations server-side (e.g., strict presets by mode).
4. Add dedicated JSON endpoints for profile/leaderboard to decouple from HTML views.
5. Add CSRF protection for form and write endpoints, especially account deletion.
6. Introduce consistent response envelope with error codes.

---

## 10) Quick Reference Matrix

| Flow | Frontend Source | Backend Entry | Response Type |
|---|---|---|---|
| Load test words | `renderWords()` | `Home::words()` | JSON array of `{word}` |
| Save test result | `sendData()` | `Home::typing()` | JSON status (`success` / 401 error) |
| Login | login form submit | `Profile::login()` | HTML view render |
| Register | signup form submit | `Profile::register()` | HTML view render |
| Logout | logout form submit | `Profile::logout()` | HTML view render |
| Delete account | danger-zone delete action | `Profile::delete()` | HTML view render (home) |
| Profile page | browser nav `/Profile` | `Profile::index()/profile()` | HTML view render |
| Leaderboard page | browser nav `/Leaderboard` | `Leaderboard::index()` | HTML view render |
| Info page | browser nav `/Info` | `Info::index()` | HTML view render |
