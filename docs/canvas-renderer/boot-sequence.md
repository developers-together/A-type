# Boot Sequence

The canvas renderer boots in 13 deterministic steps. This document defines the sequence, ownership rules, and DPR state at each step.

---

## Sequence

### Step 1: Resolve Canvas Element
```javascript
const canvas = document.getElementById('atype-canvas');
if (!canvas) throw new Error('[main] #atype-canvas not found');
```

**Ownership:** main.js  
**DPR State:** Not applied  
**Canvas State:** Empty, no context

### Step 2: Boot Screen Setup
```javascript
const _bootCtx = canvas.getContext('2d');
const _bootDpr = window.devicePixelRatio || 1;
const rect = canvas.getBoundingClientRect();
canvas.width = Math.round(rect.width * _bootDpr);
canvas.height = Math.round(rect.height * _bootDpr);
_bootCtx.scale(_bootDpr, _bootDpr);
```

**Ownership:** main.js (pre-mount)  
**DPR State:** Applied once for boot screen  
**Canvas State:** Sized, scaled, ready for boot drawing

**Rule 26:** drawBootScreen() is the ONLY raw canvas path outside Painter. Pre-mount only.

### Step 3: Draw Boot Step
```javascript
drawBootScreen('measuring display…', 0.05);
```

**Ownership:** main.js  
**DPR State:** Boot DPR applied  
**Canvas State:** Boot screen visible

**Rule 31:** Boot screen is imperative per-step drawing, not a rAF animation loop.

### Step 4: Measure Refresh Rate (~1 second)
```javascript
const refreshRate = await measureRefreshRate();
```

**Ownership:** main.js  
**DPR State:** Boot DPR applied  
**Canvas State:** Boot screen visible

**Rule 32:** Refresh rate re-validated on focus/foreground.

### Step 5: Initialize Profiler
```javascript
Profiler.init(refreshRate);
```

**Ownership:** Profiler  
**DPR State:** Boot DPR applied  
**Canvas State:** Boot screen visible

**Rule 20:** Profiler sample window is 2 seconds based on detected refresh rate.

### Step 6: Validate Responsive Config
```javascript
// Phase 4: ResponsiveConfig.validateConfig()
```

**Ownership:** ResponsiveConfig (Phase 4)  
**DPR State:** Boot DPR applied  
**Canvas State:** Boot screen visible

### Step 7: Initialize Store
```javascript
// Phase 1: Store.init()
```

**Ownership:** Store (Phase 1)  
**DPR State:** Boot DPR applied  
**Canvas State:** Boot screen visible

### Step 8: Bootstrap Auth
```javascript
const auth = bootstrapAuth(); // Reads window.__ATYPE_AUTH__
```

**Ownership:** main.js  
**DPR State:** Boot DPR applied  
**Canvas State:** Boot screen visible

**Rule 40:** Auth state from injected globals, no auth probe fetch.

### Step 9: Validate Themes
```javascript
// Phase 10: ThemeRegistry.validateAll()
```

**Ownership:** ThemeRegistry (Phase 10)  
**DPR State:** Boot DPR applied  
**Canvas State:** Boot screen visible

**Rule 17:** Theme objects validated at boot.

### Step 10: Load Font
```javascript
await loadFont(); // 3 second timeout
```

**Ownership:** main.js  
**DPR State:** Boot DPR applied  
**Canvas State:** Boot screen visible

**Rule 13:** SF Pro is never bundled. JetBrains Mono is the only font.

### Step 11: Initialize GlyphCache
```javascript
// Phase 3: GlyphCache.init({ font, sizes, chars, onProgress })
```

**Ownership:** GlyphCache (Phase 3)  
**DPR State:** Boot DPR applied  
**Canvas State:** Boot screen visible

**Rule 6:** Glyph cache must be initialized before normal text path is used.

### Step 12: Initialize Remaining Systems
```javascript
PointerNode.init(canvas);
AnimationQueue.init();
// Phase 7: InputCapture.init() (deactivated)
// Phase 7: KeyboardShortcuts.init()
// Phase 7: SoundEngine.init() (suspended)
// Phase 12: AccessibilityLayer.init()
```

**Ownership:** Various systems  
**DPR State:** Boot DPR applied  
**Canvas State:** Boot screen visible

### Step 13: Mount Renderer
```javascript
Renderer.mount(canvas, { refreshRate });
```

**Ownership:** Renderer (post-mount)  
**DPR State:** Reset by canvas.width, Renderer applies own DPR  
**Canvas State:** Renderer owns canvas surface

**Critical:** Renderer.mount() calls applySurface() which:
1. Resets context via `canvas.width = ...` (implicit reset)
2. Applies Renderer's DPR via `ctx.scale(_dpr, _dpr)`

**Rule 26 decommissioned:** drawBootScreen() no longer called after mount.

### Step 14: Mount View
```javascript
const { w, h } = Renderer.getLogicalSize();
mountHomeView(w, h);
```

**Ownership:** Router (Phase 10) or hardcoded view (Phase 2)  
**DPR State:** Renderer DPR applied  
**Canvas State:** Renderer owns, view mounted

---

## Ownership Rules

### Pre-Mount (Steps 1-12)
**Owner:** main.js  
**Canvas:** Boot screen drawing only  
**DPR:** Applied once for crisp boot screen  
**Context:** `_bootCtx` used directly

### Post-Mount (Step 13+)
**Owner:** Renderer  
**Canvas:** Renderer loop owns all drawing  
**DPR:** Reset and reapplied by Renderer  
**Context:** Painter owns all runtime draw calls

### Handoff
**Mechanism:** canvas.width assignment in applySurface()  
**Effect:** Implicitly resets context state (including boot DPR)  
**Defensive:** setTransform(1,0,0,1,0,0) before applySurface() (redundant but clear)

---

## DPR State Transitions

```
Step 1:  No DPR
Step 2:  Boot DPR applied (_bootDpr)
Step 3-12: Boot DPR active
Step 13: Reset by canvas.width, Renderer DPR applied (_dpr)
Step 14+: Renderer DPR active
```

**Key insight:** canvas.width assignment clears canvas and resets context state. This is the real reset, not setTransform().

---

## Error Handling

**Fatal errors (Steps 1-12):**
```javascript
catch (err) {
  console.error('[main] Fatal boot error:', err);
  drawBootScreen('', 0, { error: true, message: err.message });
  // Do not re-throw - leave error visible on canvas
}
```

**Non-fatal warnings:**
- Font load timeout: Continue with system monospace
- GlyphCache build error: Fall back to fillText

---

## Performance Budget

**Total boot time:** ~1.5 seconds
- Refresh rate measurement: ~1s
- Font loading: ~100ms
- GlyphCache build: ~30ms (Phase 3 minimal)
- Other init: ~50ms

**Target:** <2 seconds to first interactive frame
