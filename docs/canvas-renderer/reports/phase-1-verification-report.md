# Phase 1 Verification Report

Date: 2026-05-09  
Branch: `experimental/canvas-2d-renderer`  
Scope: Phase 1 validation (boot pipeline + bare renderer loop + backend connectivity)

## 1. Executive Summary

Phase 1 is functionally working in Docker-backed local development:

- Backend is running and reachable on `http://localhost`.
- Canvas mode is active and loading `Public/js/main.js`.
- Boot sequence completes and renderer mounts successfully.
- Frame counter is visible and animating.
- `/home/words` endpoint returns valid JSON words.
- `/Profile/delete` is delegated to backend (no canvas 404 interception).

Observed behaviors that are valid for current implementation:

- Refresh-rate detection can start at `30fps` and later move to `60hz` depending on startup conditions (window focus / throttling).
- `JetBrains Mono load timeout` warning appears; fallback to system monospace is working as designed.

## 2. Evidence Collected

### 2.1 Runtime Console Evidence (user-reported)

```
[main] detected refresh rate: 30fps
[Profiler] init - refreshRate:30fps window:60 frames
[main] auth state: guest
[Renderer] mounted - 1440x703 @2dpr 30fps
[main] boot complete
[main] JetBrains Mono load timeout - falling back to system monospace
[Renderer] resize -> ... @2dpr
```

Interpretation:

- The app booted successfully and mounted renderer.
- The refresh measurement at boot sampled 30fps (likely throttled startup conditions).
- Later visual observation of 30→60Hz is consistent with runtime revalidation behavior.
- Font timeout warning is non-fatal and expected until JetBrains Mono loading is fully wired.
- Repeated resize logs are expected while actively dragging window dimensions.

### 2.2 Backend Health Evidence

- `docker compose ps`:
  - `atype-php` up, port `80` exposed
  - `atype-mariadb` healthy
- `curl http://localhost` returned `200`.
- `curl http://127.0.0.1` returned `200`.
- `curl /home/words?amount=10` returned valid JSON array of `{ "word": "..." }` objects.

### 2.3 Frontend Integration Evidence

Rendered HTML confirms canvas mode wiring:

- Script source: `/js/main.js`
- Auth bootstrap globals present:
  - `window.__ATYPE_AUTH__`
  - `window.__ATYPE_USER__`
- Canvas host present:
  - `#renderer-host`
  - `#atype-canvas`
  - hidden `#atype-input`

### 2.4 Browser Render Evidence

Captured screenshot file:

- `/Users/adhamhaithameid/Desktop/code/A-type/phase1-localhost.png`

The screenshot shows the Phase 1 frame counter rendering on canvas.

## 3. Phase 1 Checklist Status

## 3.1 Passed

- Canvas app boots and reaches `boot complete`.
- Renderer mounts and frame counter animates.
- DPR-aware resize logs are emitted.
- Backend responds on localhost.
- Words endpoint returns data.
- `/Profile/delete` is backend-served (no canvas NotFound interception).

## 3.2 Expected/Non-blocking Warnings

- `JetBrains Mono load timeout - falling back to system monospace`
  - Current behavior is intentionally non-fatal.
  - Acceptable for Phase 1.

## 3.3 Needs Manual Final Pass (recommended before Phase 2)

- External monitor DPR transition (`2dpr` ↔ `1dpr`) visual crispness check.
- Legacy mode toggle verification (`CANVAS_RENDERER=false` path) after current uncommitted PHP toggling is finalized.
- Visibility event listener check (`APP_BACKGROUNDED`/`APP_FOREGROUNDED`) with temporary console listeners.

## 4. What Happened (Root-Cause + Resolution Timeline)

1. Localhost was initially unreachable (`ERR_CONNECTION_REFUSED`).
2. Docker stack was rebuilt and started.
3. Container naming/network conflicts were resolved.
4. Docker services stabilized (`php-app` + `mariadb` healthy).
5. Canvas mode wiring was corrected so Home loads `main.js` and canvas host markup.
6. Phase 1 renderer became visible and confirmed operational.

## 5. Affected Files in Phase 1

This section includes both committed Phase 1 implementation files and currently modified integration files used to make the environment runnable in canvas mode.

## 5.1 Committed Phase 1 Files

- `BACKEND_FRONTEND_DATA_FLOW.md`
- `plan.md`
- `Public/js/utils/math.js`
- `Public/js/core/Signal.js`
- `Public/js/core/EventBus.js`
- `Public/js/core/AnimationQueue.js`
- `Public/js/renderer/Profiler.js`
- `Public/js/renderer/PointerNode.js`
- `Public/js/renderer/Renderer.js`
- `Public/js/main.js`

## 5.2 Working-Tree Integration Files (currently modified)

- `Public/index.php`
- `App/init.php`
- `App/Views/includes/head.php`
- `App/Views/home.php`

Purpose of these modifications:

- Expose and enable canvas mode entry path.
- Choose `main.js` vs legacy script conditionally.
- Inject auth globals for frontend bootstrap.
- Render canvas host markup + hidden input in canvas mode.

## 6. Phase 1 Risks / Notes

- Refresh-rate detection at startup can under-report (`30fps`) if startup occurs under throttled conditions.
  - Not a failure, but should be refined in later phase via focus/foreground revalidation.
- JetBrains Mono is timing out currently.
  - The fallback path works; exact font loading should be tightened before GlyphCache benchmark comparisons.

## 7. Recommendation

Phase 1 can be accepted as complete for architecture progression, with two pragmatic follow-ups before deep Phase 2 work:

1. Finalize font-loading path for JetBrains Mono (to reduce fallback noise).
2. Run one explicit manual pass for external-monitor DPR transition and legacy toggle.

---

## 8. Post-Review Fixes Applied (2026-05-09)

Based on review feedback, the following fixes were implemented immediately:

1. Centralized canvas flag in one config file:
   - Added `App/Config/config.php` with `CANVAS_RENDERER` definition.
   - Removed hardcoded define blocks from:
     - `Public/index.php`
     - `App/init.php`
   - Both now require config instead of redefining the flag.

2. Added local JetBrains Mono font assets:
   - Created `Public/fonts/JetBrainsMono-Regular.woff2`
   - Created `Public/fonts/JetBrainsMono-Bold.woff2`

3. Added `@font-face` declarations in canvas script path:
   - Updated `App/Views/includes/head.php` to inject local JetBrains faces when canvas script is active.

4. Re-verified font asset serving:
   - `GET /fonts/JetBrainsMono-Regular.woff2` → `200 OK`
   - `GET /fonts/JetBrainsMono-Bold.woff2` → `200 OK`

### Expected Outcome After Hard Refresh

- The `JetBrains Mono load timeout` warning should disappear.
- If warning persists in an open tab, perform a hard refresh (`Cmd+Shift+R`) to bypass cache and reload CSS/font declarations.

## 9. Updated Affected Files (including post-review fixes)

- `App/Config/config.php` (new)
- `Public/index.php` (updated to read config)
- `App/init.php` (updated to read config)
- `App/Views/includes/head.php` (font-face + script selection path)
- `App/Views/home.php` (canvas host + auth globals branch)
- `Public/fonts/JetBrainsMono-Regular.woff2` (new)
- `Public/fonts/JetBrainsMono-Bold.woff2` (new)

