# A-Type Canvas Renderer — Final Master Plan

## 1. Objective
Build a canvas-first typing experience for A-Type with native JavaScript and CSS only, no external dependencies, and no build step, while keeping backend contracts unchanged and delegating non-typing pages to backend HTML navigation.

## 2. Mandatory Branch Baseline (Before Any Work)
1. Branch safety baseline:
   - `experimental/canvas-2d-renderer` must be based on current `Master`.
   - Create backup branch before forced reset.
2. Verification gates:
   - `git rev-parse HEAD` on `experimental/canvas-2d-renderer` must equal `git rev-parse Master`.
   - Working tree status should be reviewed before any commit.
3. Non-goal:
   - Do not revert unrelated pre-existing changes unless explicitly requested.

## 3. Product Scope and Integration Reality
1. Backend integration surface for canvas typing flow:
   - `GET /home/words?amount=<n>` -> JSON words.
   - `POST /home/typing` -> JSON success/error.
2. All other routes are backend-rendered HTML and should remain full-page navigations.
3. Canvas renderer scope:
   - Home typing surface.
   - Active test.
   - Results.
   - Settings overlay.
   - Canvas NotFound fallback only for canvas-owned routes.
4. Out of scope:
   - Rebuilding backend HTML pages (Leaderboard/Profile/Info) as canvas views.
   - Modifying backend controllers/models/routes/schema.

## 4. Final Architecture
1. Unidirectional flow:
   - `Input -> Signal/Store -> SceneGraph -> Differ -> Painter -> Canvas`
2. Renderer ownership:
   - Runtime draw calls happen through Renderer/Painter only.
3. Node model:
   - Nodes are pure data + computed layout/animation state.
   - Nodes never own persistent canvas context.
4. Paint scheduling:
   - State updates invalidate nodes/regions.
   - rAF loop decides commit timing.

## 5. Backend-Aligned Frontend Contracts
1. `api.js`:
   - Global `credentials: 'include'`.
   - `get(endpoint)` for JSON reads.
   - `post(endpoint, data, encoding)` supports `json` and `form`.
   - `/home/typing` must always use `form` encoding.
   - `401` emits `SESSION_EXPIRED`.
2. `SessionModel.getWords(amount)`:
   - Clamp amount to `1..200`.
   - Normalize `Array<{word:string}>` into `string[]`.
   - Fallback to bundled words on failure.
3. `SessionModel.saveResult(data)`:
   - Form-encoded payload only.
   - Return structured result status, not throw-only behavior.
   - Quote mode maps to backend-compatible mode (`time`) when saving.
4. Punctuation/numbers:
   - Applied client-side after fetch.
   - Not sent as query params to `/home/words`.
   - Sent as save flags to `/home/typing`.
5. Auth bootstrap:
   - Use template-injected globals (`window.__ATYPE_AUTH__`, `window.__ATYPE_USER__`).
   - No dedicated auth probe call.
6. Router delegation:
   - `/Leaderboard`, `/Profile`, `/Info`, and all `/Profile/*` delegate to browser navigation.

## 6. Final Invariants (1-43)
1. Unidirectional flow only.
2. Renderer owns runtime canvas drawing.
3. No immediate synchronous repaint on state mutation.
4. Input focus lifecycle is explicit during active tests.
5. Nodes are pure data plus computed runtime state.
6. Glyph cache must be initialized before normal text path is used.
7. No silent failures in renderer/data pipeline.
8. Test elapsed timing uses rAF timestamp deltas.
9. `window.resize` and `visualViewport.resize` are handled separately.
10. Interactive regions declare `interactive` and bounds.
11. Hot-path object reuse/pooling after Phase 5.
12. Debug features gated by `DEBUG` and zero-cost in production.
13. SF Pro is never bundled.
14. JetBrains Mono is the only font used for canvas rendering.
15. All interpolation is delta-time based.
16. Clean-frame check prevents diff/layout/paint work.
17. Theme objects validated at boot.
18. Sound is opt-in and non-blocking.
19. Shared animation math lives in `utils/math.js`.
20. Profiler sample window is two seconds based on detected refresh rate.
21. Delta is clamped to `2 * (1 / refreshRate)`.
22. Pointer events are centralized.
23. Animation conflicts are managed by AnimationQueue ownership rules.
24. Quote mode is first-class in the typing engine.
25. Word buffer refetch is silent and fallback-backed.
26. `drawBootScreen()` is the only pre-mount raw canvas exception outside Painter.
27. Slider/TextInput interaction routes through pointer/event architecture.
28. Auth-required canvas routes redirect before mount.
29. LiveGraph uses fixed 220 WPM Y-axis and rolling smoothing.
30. TextInput paste is regex-validated per instance.
31. Boot screen is imperative per-step drawing, not a rAF animation loop.
32. Refresh rate is revalidated on focus/foreground and updates profiler/clamp on drift.
33. `AnimationQueue.tick()` runs before dirty-check.
34. Ligature-sensitive metric drift is disallowed and tested.
35. `SESSION_EXPIRED` mid-test stops safely, shows message, redirects home.
36. `/home/typing` is always form-encoded.
37. `/home/words` data is normalized before entering renderer state.
38. External backend routes never mount canvas views.
39. Punctuation/numbers are client-side transforms only.
40. Auth state is from injected globals, no auth probe fetch.
41. Quote mode save uses backend-compatible mode mapping.
42. Word-mode warning is failure-reactive only.
43. Router prefix delegation must pass `/Profile/*` routes directly to backend.

## 7. Final File Structure
```
Public/js/
├── core/
│   ├── Router.js
│   ├── Component.js
│   ├── Store.js
│   ├── EventBus.js
│   ├── Signal.js
│   ├── KeyboardShortcuts.js
│   └── AnimationQueue.js
├── renderer/
│   ├── Renderer.js
│   ├── SceneGraph.js
│   ├── Differ.js
│   ├── Painter.js
│   ├── LayoutEngine.js
│   ├── GlyphCache.js
│   ├── DirtyRegions.js
│   ├── ResponsiveConfig.js
│   ├── Profiler.js
│   └── nodes/
│       ├── BaseNode.js
│       ├── RectNode.js
│       ├── TextNode.js
│       ├── GlyphNode.js
│       ├── CursorNode.js
│       ├── WordLineNode.js
│       ├── ScrollContainerNode.js
│       ├── LiveGraphNode.js
│       ├── TextInputNode.js
│       ├── SliderNode.js
│       ├── TooltipNode.js
│       └── PointerNode.js
├── audio/
│   └── SoundEngine.js
├── input/
│   ├── InputCapture.js
│   ├── IMEHandler.js
│   └── AccessibilityLayer.js
├── themes/
│   ├── base.js
│   ├── index.js
│   ├── monochrome/
│   ├── nature/
│   ├── retro/
│   ├── modern/
│   ├── accessible/
│   └── special/
├── data/
│   ├── quotes.js
│   └── fallbackWords.js
├── views/
│   ├── HomeView.js
│   ├── TestView.js
│   ├── ResultsView.js
│   ├── SettingsView.js
│   └── NotFoundView.js
├── models/
│   ├── UserModel.js
│   ├── SessionModel.js
│   └── QuoteModel.js
├── utils/
│   ├── api.js
│   ├── DOM.js
│   └── math.js
├── tests/
│   ├── runner.js
│   ├── integration/
│   │   ├── boot.test.js
│   │   ├── typing.test.js
│   │   ├── theme-switch.test.js
│   │   ├── resize.test.js
│   │   ├── quote-mode.test.js
│   │   └── session-expiry.test.js
│   ├── Signal.test.js
│   ├── Differ.test.js
│   ├── GlyphCache.test.js
│   ├── LayoutEngine.test.js
│   ├── ResponsiveConfig.test.js
│   ├── Theme.test.js
│   ├── SoundEngine.test.js
│   ├── AnimationQueue.test.js
│   └── QuoteModel.test.js
└── main.js
```

## 8. Boot Sequence (Deterministic)
1. Resolve canvas element.
2. Apply pre-renderer DPR setup.
3. Draw imperative boot step.
4. Measure refresh rate (~1s).
5. Validate responsive config.
6. Initialize Store and persisted keys.
7. Bootstrap auth from injected globals.
8. Validate themes and contrast.
9. Draw boot error and halt on validation failure.
10. Load JetBrains Mono with timeout fallback warning.
11. Initialize GlyphCache with progress callbacks.
12. Initialize PointerNode.
13. Initialize KeyboardShortcuts.
14. Initialize SoundEngine suspended.
15. Initialize AnimationQueue.
16. Initialize InputCapture in deactivated mode.
17. Initialize AccessibilityLayer.
18. Initialize Router and mount first view.
19. Mount Renderer.
20. Retire pre-renderer boot drawing path.

## 9. Renderer Loop (Final Order)
1. Schedule next `requestAnimationFrame`.
2. Compute clamped delta.
3. Tick AnimationQueue.
4. Dirty check after tick.
5. Exit if clean.
6. Begin profiler sample.
7. Snapshot + diff.
8. Layout recompute if invalid.
9. Paint patches/full repaint.
10. Clear dirty state and recycle objects.
11. End profiler sample.
12. Catch errors without killing loop.

## 10. Responsive and Pixel Rules
1. Logical pixels everywhere above renderer.
2. DPR applied only at canvas surface.
3. Layout breakpoints derive from logical width.
4. Max content width lock at large breakpoints.
5. Debounced resize pipeline with full invalidate.
6. Pixel snapping in Painter for crisp geometry and text baselines.

## 11. Typing Engine and Interaction
1. Modes: time, words, quote.
2. Hard mode blocks invalid space-advance.
3. Character states drive visual semantics.
4. Word buffer preload/refetch strategy:
   - preload 200
   - refetch at 60 remaining
   - fetch batch 200
5. LiveGraph updates once per second and uses fixed Y-axis.
6. Cursor movement and all animation are delta-time based.

## 12. Theme System
1. 23 themes with schema validation.
2. Contrast checks at boot.
3. Theme transitions via dissolve with performance fallback.
4. Custom theme slot persisted and validated.

## 13. Accessibility
1. ARIA stats and completion announcements.
2. Incorrect-character immediate assertive announcement.
3. Settings accessibility overlay mirrored from Store.
4. Store remains single source of truth across canvas and overlay.

## 14. Sound
1. Off by default.
2. Web Audio initialized suspended, resumed on gesture.
3. Correct/error/complete sounds.
4. Waveform gain normalization plus master volume control.
5. Never block renderer on sound failure.

## 15. Phases and Acceptance

### Phase 1
Scope:
1. Feature flag + canvas host conditional.
2. Auth globals injection.
3. `math.js`, `Signal.js`, `EventBus.js`.
4. `Profiler`, `PointerNode`, `AnimationQueue` stubs.
5. `main.js` boot pipeline.
6. `Renderer.js` bare loop + frame counter.
7. Legacy script detached for canvas-enabled path.

Acceptance:
1. Crisp frame counter on 2x and 1x displays.
2. DPR recompute when moving between displays.
3. Refresh rate detected and logged.
4. `/Profile/delete` delegated to backend (no NotFound mount).
5. Legacy mode still works when flag false.

### Phase 2
1. SceneGraph core.
2. Base nodes + static Painter.
3. DEBUG validations.
4. Hit-test foundation.

### Phase 3
1. GlyphCache init and progress.
2. Font load gate.
3. Ligature-safe measurement acceptance test.
4. Cache validate/rebuild path.

### Phase 4
1. LayoutEngine + ResponsiveConfig.
2. Config validation.
3. Large-screen width lock.
4. ScrollContainer layout contract.

### Phase 5
1. Differ + DirtyRegions.
2. Patch budget fallback.
3. Pooling for patches/rects.
4. Profiler pool metrics.

### Phase 6
1. WordLineNode + GlyphNode.
2. Instant line-step scrolling.
3. LiveGraph render behavior.
4. Error shake and subtle micro-interactions.

### Phase 7
1. InputCapture + IME.
2. KeyboardShortcuts wiring.
3. SoundEngine integration.
4. Touch-safe PointerNode behavior.
5. Client punctuation/numbers transforms.

### Phase 8
1. Cursor styles and behavior.
2. TextInputNode implementation.
3. SliderNode implementation.

### Phase 9
1. Full TestView lifecycle.
2. ResultsView animation + export.
3. Save flow and warning logic.
4. Session-expired flow.
5. Context-loss handling.

### Phase 10
1. SettingsView completion.
2. Theme registry and custom theme.
3. AnimationQueue conflict modes finalized.

### Phase 11
1. Scroll momentum and keyboard nav polish for canvas-owned surfaces.
2. Quote mode consistency polish.

### Phase 12
1. Accessibility finalization.
2. Overlay sync and extended announcements.

### Phase 13 (optional)
1. WebGL Painter backend upgrade path only.

## 16. Testing Strategy
1. Unit tests per module.
2. Integration tests for end-to-end pipeline.
3. Manual device matrix:
   - MacBook Air M1 (2x) required.
   - External 1080p (1x) required.
   - 1440p, 4K, iPad landscape, iPhone degraded.
4. Performance targets:
   - active typing <1ms
   - full repaint <3ms
   - P99 <2ms
   - input-to-visual <8ms

## 17. Documentation Deliverables
Create and maintain:
1. `docs/canvas-renderer/README.md`
2. `docs/canvas-renderer/phase-roadmap.md`
3. `docs/canvas-renderer/invariants.md`
4. `docs/canvas-renderer/boot-sequence.md`
5. `docs/canvas-renderer/boot-screen-design.md`
6. `docs/canvas-renderer/render-loop.md`
7. `docs/canvas-renderer/120fps-budget.md`
8. `docs/canvas-renderer/responsive-system.md`
9. `docs/canvas-renderer/font-policy.md`
10. `docs/canvas-renderer/theme-system.md`
11. `docs/canvas-renderer/glyph-cache.md`
12. `docs/canvas-renderer/input-pointer-ime.md`
13. `docs/canvas-renderer/micro-interactions.md`
14. `docs/canvas-renderer/settings-panel.md`
15. `docs/canvas-renderer/slider-node.md`
16. `docs/canvas-renderer/results-screen.md`
17. `docs/canvas-renderer/quote-mode.md`
18. `docs/canvas-renderer/audio.md`
19. `docs/canvas-renderer/error-handling.md`
20. `docs/canvas-renderer/testing-strategy.md`
21. `docs/canvas-renderer/test-matrix.md`
22. `docs/canvas-renderer/accessibility-settings.md`
23. `docs/canvas-renderer/animation-queue.md`
24. `docs/canvas-renderer/troubleshooting.md`
25. `docs/canvas-renderer/changelog.md`

## 18. Final Readiness
The specification is complete and implementation-ready.
1. Backend-compatible.
2. Sequencing-safe.
3. Performance-accountable.
4. Accessibility-covered.
5. Documentation-scaffolded.

Execution starts at Phase 1 with strict scope discipline.
