// Public/js/main.js
// Application entry point. Boots the canvas renderer in strict sequence.
// No module imported here does any work on import - everything is explicit.
//
// Boot order is deterministic and documented in docs/canvas-renderer/boot-sequence.md
// Rule 26: drawBootScreen() is the ONLY raw canvas path outside Painter. Pre-mount only.
// Rule 31: Boot screen is imperative per-step, never a rAF animation loop.

import { Profiler } from './renderer/Profiler.js';
import { PointerNode } from './renderer/PointerNode.js';
import { Renderer } from './renderer/Renderer.js';
import { GlyphCache } from './renderer/GlyphCache.js';
import { AnimationQueue } from './core/AnimationQueue.js';
import { EventBus, EVENTS } from './core/EventBus.js';
import { Store } from './core/Store.js';
import { Router } from './core/Router.js';
import { ThemeRegistry } from './themes/index.js';

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

// Note: DPR scaling is handled entirely by Renderer.mount() - do NOT scale here
// or context will be scaled dpr² (double-scaled)

// Boot screen context - get once, apply DPR for crisp Retina rendering
// Rule 26: This is the ONLY pre-mount raw canvas path. Renderer.mount() will
// reset transform via setTransform(1,0,0,1,0,0) before applying its own DPR.
const _bootCtx = canvas.getContext('2d');
const _bootDpr = window.devicePixelRatio || 1;

// Apply DPR to boot screen for crisp rendering on Retina
// Renderer.mount() will reset this via ctx.setTransform() before its own scaling
const rect = canvas.getBoundingClientRect();
canvas.width = Math.round(rect.width * _bootDpr);
canvas.height = Math.round(rect.height * _bootDpr);
_bootCtx.scale(_bootDpr, _bootDpr);

// -- Boot screen ---------------------------------------------------------------
// Rule 26: raw canvas calls sanctioned here only, pre-mount.
// Rule 31: called imperatively once per step, never looped.

function drawBootScreen(label, progress = 0, options = {}) {
  const { error = false, message = '' } = options;

  // Get current logical dimensions
  const rect = canvas.getBoundingClientRect();
  const w = rect.width;
  const h = rect.height;
  
  _bootCtx.clearRect(0, 0, w, h);

  // Background
  _bootCtx.fillStyle = BOOT_COLORS.background;
  _bootCtx.fillRect(0, 0, w, h);

  // Wordmark
  _bootCtx.font = `600 24px ${BOOT_FONT}`;
  _bootCtx.fillStyle = BOOT_COLORS.text;
  _bootCtx.textAlign = 'center';
  _bootCtx.textBaseline = 'alphabetic';
  _bootCtx.fillText('a-type', w / 2, h / 2 - 32);

  // Status label
  _bootCtx.font = `400 13px ${BOOT_FONT}`;
  _bootCtx.fillStyle = error ? BOOT_COLORS.error : BOOT_COLORS.dim;
  _bootCtx.fillText(error ? message || 'boot failed' : label, w / 2, h / 2 + 4);

  // Progress bar
  const barW = 160;
  const barH = 2;
  const barX = w / 2 - barW / 2;
  const barY = h / 2 + 24;

  // Track
  _bootCtx.fillStyle = BOOT_COLORS.trackBg;
  _bootCtx.fillRect(Math.floor(barX), barY, barW, barH);

  // Fill
  _bootCtx.fillStyle = error ? BOOT_COLORS.error : BOOT_COLORS.accent;
  _bootCtx.fillRect(Math.floor(barX), barY, Math.floor(barW * Math.min(progress, 1)), barH);

  // Error detail message
  if (error && message) {
    _bootCtx.font = `400 11px ${BOOT_FONT}`;
    _bootCtx.fillStyle = BOOT_COLORS.error;
    _bootCtx.fillText(message, w / 2, h / 2 + 44);
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
    Store.init();

    // Step 5 - auth bootstrap
    drawBootScreen('checking session…', 0.30);
    const auth = bootstrapAuth();
    console.log(`[main] auth state: ${auth.authed ? 'authenticated' : 'guest'}`);

    // Step 6 - validate theme registry
    drawBootScreen('loading themes…', 0.35);
    ThemeRegistry.init();

    // Step 7 - load JetBrains Mono
    drawBootScreen('loading font…', 0.45);
    await loadFont();

    // Step 8 - initialize GlyphCache
    drawBootScreen('building glyph cache…', 0.50);
    await GlyphCache.init({
      sizes: [20],
      weights: [400, 600, 700],
      color: '#d1d0c5',
      onProgress: (done, total) => {
        drawBootScreen('building glyph cache…', 0.50 + (done / total) * 0.25);
      },
    });

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

    // Step 12 - mount Renderer
    drawBootScreen('launching…', 1.0);
    Renderer.mount(canvas, { refreshRate });

    // Step 13 - init Router (after canvas ready)
    // Router.init() calls mountHomeView which needs Renderer mounted first
    Router.init();

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
