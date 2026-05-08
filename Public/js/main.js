// Public/js/main.js
// Application entry point. Boots the canvas renderer in strict sequence.
// No module imported here does any work on import - everything is explicit.
//
// Boot order is deterministic and documented in docs/canvas-renderer/boot-sequence.md
// Rule 26: drawBootScreen() is the ONLY raw canvas path outside Painter. Pre-mount only.
// Rule 31: Boot screen is imperative per-step, never a rAF animation loop.

import { Profiler } from './renderer/Profiler.js';
import { PointerNode } from './renderer/PointerNode.js';
import { AnimationQueue } from './core/AnimationQueue.js';
import { EventBus, EVENTS } from './core/EventBus.js';

// -- Constants ----------------------------------------------------------------

// Hardcoded midnight palette for boot screen.
// Theme system not loaded yet at this point.
// Documented in docs/canvas-renderer/boot-screen-design.md as intentional.
const BOOT_COLORS = {
  background: '#0a0a0a',
  text: '#d1d0c5',
  dim: '#646669',
  accent: '#e2b714',
  error: '#ca4754',
  trackBg: '#2c2e31',
};

const BOOT_FONT = '"JetBrains Mono", monospace'; // Rule 14
const FONT_LOAD_TIMEOUT_MS = 3000;

// -- Pre-renderer canvas setup ------------------------------------------------

const canvas = document.getElementById('atype-canvas');

if (!canvas) {
  // Canvas host not present - legacy mode or wrong page. Bail silently.
  // The PHP CANVAS_RENDERER flag controls whether this script loads at all.
  throw new Error('[main] #atype-canvas not found - is CANVAS_RENDERER enabled?');
}

// DPR-correct surface sizing - Rule 3 (DPR only at surface)
const dpr = window.devicePixelRatio || 1;
const rect = canvas.getBoundingClientRect();
canvas.width = Math.round(rect.width * dpr);
canvas.height = Math.round(rect.height * dpr);
const ctx = canvas.getContext('2d');
ctx.scale(dpr, dpr);

// Logical dimensions (what all layout code uses)
let logicalW = rect.width;
let logicalH = rect.height;

// -- Boot screen ---------------------------------------------------------------
// Rule 26: raw canvas calls sanctioned here only, pre-mount.
// Rule 31: called imperatively once per step, never looped.

function drawBootScreen(label, progress = 0, options = {}) {
  const { error = false, message = '' } = options;

  ctx.clearRect(0, 0, logicalW, logicalH);

  // Background
  ctx.fillStyle = BOOT_COLORS.background;
  ctx.fillRect(0, 0, logicalW, logicalH);

  // Wordmark
  ctx.font = `600 24px ${BOOT_FONT}`;
  ctx.fillStyle = BOOT_COLORS.text;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('a-type', logicalW / 2, logicalH / 2 - 32);

  // Status label
  ctx.font = `400 13px ${BOOT_FONT}`;
  ctx.fillStyle = error ? BOOT_COLORS.error : BOOT_COLORS.dim;
  ctx.fillText(error ? message || 'boot failed' : label, logicalW / 2, logicalH / 2 + 4);

  // Progress bar
  const barW = 160;
  const barH = 2;
  const barX = logicalW / 2 - barW / 2;
  const barY = logicalH / 2 + 24;

  // Track
  ctx.fillStyle = BOOT_COLORS.trackBg;
  ctx.fillRect(Math.floor(barX), barY, barW, barH);

  // Fill
  ctx.fillStyle = error ? BOOT_COLORS.error : BOOT_COLORS.accent;
  ctx.fillRect(Math.floor(barX), barY, Math.floor(barW * Math.min(progress, 1)), barH);

  // Error detail message
  if (error && message) {
    ctx.font = `400 11px ${BOOT_FONT}`;
    ctx.fillStyle = BOOT_COLORS.error;
    ctx.fillText(message, logicalW / 2, logicalH / 2 + 44);
  }
}

// -- Refresh rate measurement --------------------------------------------------
// Uses rAF internally. Called once during boot - the ONLY rAF use before
// Renderer.mount(). Takes ~1 second.
// Rule 32: result stored and re-validated on focus/foreground (handled in Renderer).

function measureRefreshRate() {
  return new Promise(resolve => {
    const STANDARD_RATES = [30, 60, 90, 120, 144, 165, 240];
    let frames = 0;
    const start = performance.now();

    function tick(timestamp) {
      frames++;
      if (timestamp - start < 1000) {
        requestAnimationFrame(tick);
      } else {
        // Snap to nearest standard rate
        const measured = Math.round(frames / ((timestamp - start) / 1000));
        const snapped = STANDARD_RATES.reduce((a, b) =>
          Math.abs(b - measured) < Math.abs(a - measured) ? b : a
        );
        resolve(snapped);
      }
    }

    requestAnimationFrame(tick);
  });
}

// -- Font loading --------------------------------------------------------------

function loadFont() {
  return Promise.race([
    document.fonts.load(`20px ${BOOT_FONT}`),
    new Promise(resolve =>
      setTimeout(() => {
        console.warn('[main] JetBrains Mono load timeout - falling back to system monospace');
        resolve(null); // non-fatal, boot continues
      }, FONT_LOAD_TIMEOUT_MS)
    ),
  ]);
}

// -- Auth bootstrap ------------------------------------------------------------
// Rule 40: auth state is read from PHP-injected globals, no fetch.

function bootstrapAuth() {
  const authed = window.__ATYPE_AUTH__ === true;
  const user = window.__ATYPE_USER__ ?? null;
  return { authed, user };
}

// -- Boot sequence -------------------------------------------------------------

async function boot() {
  try {
    // Step 1 - measure display refresh rate (~1 second)
    drawBootScreen('measuring display…', 0.05);
    const refreshRate = await measureRefreshRate();
    console.log(`[main] detected refresh rate: ${refreshRate}fps`);

    // Step 2 - initialize Profiler with measured rate (Rule 20)
    drawBootScreen('initializing…', 0.15);
    Profiler.init(refreshRate);

    // Step 3 - validate responsive config
    // ResponsiveConfig added in Phase 4 - stub check for now
    drawBootScreen('validating config…', 0.20);
    // Phase 4: ResponsiveConfig.validateConfig() - throws on missing keys

    // Step 4 - initialize Store and persisted settings
    drawBootScreen('loading settings…', 0.25);
    // Phase 10: Store.init() - reads localStorage, validates keys

    // Step 5 - auth bootstrap
    drawBootScreen('checking session…', 0.30);
    const auth = bootstrapAuth();
    console.log(`[main] auth state: ${auth.authed ? 'authenticated' : 'guest'}`);

    // Step 6 - validate theme registry
    drawBootScreen('loading themes…', 0.35);
    // Phase 10: ThemeRegistry.validateAll() - throws on schema/contrast error

    // Step 7 - load JetBrains Mono
    drawBootScreen('loading font…', 0.45);
    await loadFont();

    // Step 8 - initialize GlyphCache
    drawBootScreen('building glyph cache…', 0.50);
    // Phase 3: GlyphCache.init({ font, sizes, chars })
    //   GlyphCache.onProgress = (loaded, total) => {
    //     drawBootScreen('building glyph cache…', 0.50 + (loaded/total) * 0.25);
    //   };

    // Step 9 - initialize PointerNode
    drawBootScreen('wiring input…', 0.78);
    PointerNode.init(canvas);

    // Step 10 - initialize AnimationQueue
    drawBootScreen('wiring animations…', 0.82);
    AnimationQueue.init();

    // Step 11 - initialize remaining systems (Phase 7, 12)
    drawBootScreen('ready…', 0.95);
    // Phase 7:  InputCapture.init()    (deactivated)
    // Phase 7:  KeyboardShortcuts.init()
    // Phase 7:  SoundEngine.init()     (suspended)
    // Phase 12: AccessibilityLayer.init()

    // Step 12 - mount Renderer (Phase 1 - Renderer.js next commit)
    drawBootScreen('launching…', 1.0);
    // Phase 1 (next): Renderer.mount(canvas, { refreshRate, logicalW, logicalH, dpr })

    // Step 13 - initialize Router and mount view (Phase 10)
    // Phase 10: Router.init()

    // -- Boot complete ---------------------------------------------------------
    // Rule 26: drawBootScreen is decommissioned after Renderer.mount().
    // After mount, Renderer/Painter own the canvas surface entirely.
    console.log('[main] boot complete');
  } catch (err) {
    // Fatal boot error - draw error state on boot screen
    // Rule 7: no silent failures
    console.error('[main] Fatal boot error:', err);
    drawBootScreen('', 0, {
      error: true,
      message: err.message ?? 'unknown error',
    });
    // Do not re-throw - leave error visible on canvas for diagnosis
  }
}

// -- Visibility change (Rule 32) ----------------------------------------------
// Re-validation of refresh rate on foreground handled in Renderer (Phase 1 next).
// EventBus events emitted here for other systems to react.

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    EventBus.emit(EVENTS.APP_BACKGROUNDED);
  } else {
    EventBus.emit(EVENTS.APP_FOREGROUNDED);
  }
});

// -- Start --------------------------------------------------------------------

boot();
