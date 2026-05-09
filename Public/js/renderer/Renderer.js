// Public/js/renderer/Renderer.js
// The render loop. Owns the canvas surface at runtime.
// Rule 2:  Renderer is the only owner of canvas draw calls during runtime.
// Rule 3:  State changes never trigger immediate paint - invalidate and defer.
// Rule 16: Clean-frame short-circuit - no diff/layout/paint if nothing is dirty.
// Rule 33: AnimationQueue.tick() runs before dirty check each frame.
// Rule 15: All animation uses deltaSeconds - frame-rate independent.
// Rule 21: deltaSeconds clamped to 2 x (1 / refreshRate).
// Rule 32: Refresh rate re-validated on window focus.
//
// Phase 1 delivers:
//   - DPR-correct canvas surface mount
//   - Resize handling with debounce
//   - rAF loop with delta clamp
//   - AnimationQueue tick
//   - DirtyRegions clean-frame short-circuit (stub)
//   - Frame counter drawn in top-left (dev only)
//   - Profiler begin/end per frame
//
// Phases 2-9 fill in: SceneGraph snapshot, Differ, LayoutEngine, Painter patches.

import { Profiler } from './Profiler.js';
import { AnimationQueue } from '../core/AnimationQueue.js';
import { EventBus, EVENTS } from '../core/EventBus.js';

// -- State --------------------------------------------------------------------

let _canvas = null;
let _ctx = null;
let _dpr = 1;
let _logicalW = 0;
let _logicalH = 0;
let _refreshRate = 60;
let _maxDelta = 1 / 30; // 2 x (1/60) - updated on mount
let _lastTs = null;
let _running = false;
let _frameCount = 0;
let _resizeTimer = null;
let _dprMediaQuery = null;
let _dprListener = null;

// -- DirtyRegions stub ---------------------------------------------------------
// Real implementation in Phase 5.
// For Phase 1: always dirty so frame counter redraws every frame.

const DirtyRegions = {
  isClean() {
    return false;
  }, // Phase 1: never skip
  markFull() {},
  clear() {},
};

// -- Surface sizing ------------------------------------------------------------

function applySurface() {
  _dpr = window.devicePixelRatio || 1;
  const rect = _canvas.getBoundingClientRect();
  _logicalW = rect.width;
  _logicalH = rect.height;
  _canvas.width = Math.round(rect.width * _dpr);
  _canvas.height = Math.round(rect.height * _dpr);
  _ctx.setTransform(1, 0, 0, 1, 0, 0); // reset any prior scale
  _ctx.scale(_dpr, _dpr);
}

// -- Resize handling -----------------------------------------------------------
// Rule 9: window.resize and visualViewport.resize are separate concerns.

function handleResize() {
  applySurface();
  // Phase 4: LayoutEngine.invalidateAll()
  // Phase 3: GlyphCache.validate()
  DirtyRegions.markFull();
  console.log(`[Renderer] resize -> ${_logicalW}x${_logicalH} @${_dpr}dpr`);
}

function onWindowResize() {
  clearTimeout(_resizeTimer);
  _resizeTimer = setTimeout(handleResize, 100); // 100ms debounce
}

// visualViewport handles virtual keyboard - does NOT feed into handleResize
// Phase 7: InputCapture suppresses virtual-keyboard resize spikes here

// -- DPR change detection ------------------------------------------------------
// Rule 32: immediate remount when display changes (e.g. drag to external monitor)
// matchMedia fires immediately on DPR change - bypasses 100ms debounce.

function watchDPR() {
  if (_dprMediaQuery && _dprListener) {
    _dprMediaQuery.removeEventListener('change', _dprListener);
  }

  _dprMediaQuery = window.matchMedia(`(resolution: ${_dpr}dppx)`);
  _dprListener = () => {
    handleResize(); // immediate, no debounce
    watchDPR(); // re-register for new DPR value
  };
  _dprMediaQuery.addEventListener('change', _dprListener);
}

// -- Refresh rate re-validation ------------------------------------------------
// Rule 32: re-measure on focus. Large drift updates profiler + delta clamp.

async function revalidateRefreshRate() {
  // Lightweight - counts rAF callbacks over 500ms instead of full 1s
  const start = performance.now();
  let frames = 0;

  await new Promise(resolve => {
    function tick(ts) {
      frames++;
      if (ts - start < 500) requestAnimationFrame(tick);
      else resolve();
    }
    requestAnimationFrame(tick);
  });

  const STANDARD = [30, 60, 90, 120, 144, 165, 240];
  const measured = Math.round(frames / 0.5);
  const snapped = STANDARD.reduce((a, b) =>
    Math.abs(b - measured) < Math.abs(a - measured) ? b : a
  );

  const drift = Math.abs(snapped - _refreshRate);
  if (drift > 20) {
    console.log(`[Renderer] refresh rate changed: ${_refreshRate}fps -> ${snapped}fps`);
    _refreshRate = snapped;
    _maxDelta = (1 / _refreshRate) * 2;
    Profiler.init(_refreshRate);
    EventBus.emit(EVENTS.REFRESH_RATE_CHANGED, { rate: _refreshRate });
  }
}

function onAppForegrounded() {
  DirtyRegions.markFull(); // repaint on tab return
}

// -- Frame counter (Phase 1 only, dev visual) ---------------------------------

function drawFrameCounter() {
  const DEBUG = typeof __DEBUG__ !== 'undefined' ? __DEBUG__ : true;
  if (!DEBUG) return;

  const { avg, p99 } = Profiler.report();
  const label = [
    `frame: ${_frameCount}`,
    `${_refreshRate}hz`,
    `${_logicalW.toFixed(0)}x${_logicalH.toFixed(0)}`,
    `@${_dpr}dpr`,
    avg > 0 ? `avg:${avg.toFixed(2)}ms p99:${p99.toFixed(2)}ms` : '',
  ]
    .filter(Boolean)
    .join('  ');

  _ctx.save();
  _ctx.font = '11px "JetBrains Mono", monospace';
  _ctx.fillStyle = 'rgba(0,0,0,0.55)';
  _ctx.fillRect(8, 8, label.length * 6.8, 18);
  _ctx.fillStyle = '#e2b714';
  _ctx.textBaseline = 'top';
  _ctx.textAlign = 'left';
  _ctx.fillText(label, 12, 11);
  _ctx.restore();
}

// -- rAF loop -----------------------------------------------------------------

function loop(timestamp) {
  if (!_running) return;
  requestAnimationFrame(safeLoop); // Rule: schedule next frame FIRST

  // Delta time - clamped (Rule 21)
  if (_lastTs === null) _lastTs = timestamp;
  const rawDelta = (timestamp - _lastTs) / 1000;
  const deltaSeconds = Math.min(rawDelta, _maxDelta);
  _lastTs = timestamp;

  // Tick animations before dirty check (Rule 33)
  AnimationQueue.tick(deltaSeconds);

  // Clean-frame short-circuit (Rule 16)
  // Phase 1: DirtyRegions.isClean() always returns false - loop always paints
  if (DirtyRegions.isClean()) return;

  Profiler.begin();

  // -- Phase 1: clear + frame counter -----------------------------------------
  // Phases 2-9 replace this with: snapshot -> diff -> layout -> Painter.applyPatches()
  _ctx.clearRect(0, 0, _logicalW, _logicalH);

  // Dark background so counter is visible
  _ctx.fillStyle = '#0a0a0a';
  _ctx.fillRect(0, 0, _logicalW, _logicalH);

  drawFrameCounter();
  _frameCount++;

  DirtyRegions.clear();
  Profiler.end();
}

// -- Error containment ---------------------------------------------------------
// A throwing frame must never kill the loop.
// Wrap loop body - rAF is already scheduled before any work so loop survives.

function safeLoop(timestamp) {
  try {
    loop(timestamp);
  } catch (err) {
    console.error('[Renderer] Frame error:', err);
    DirtyRegions.clear(); // prevent infinite dirty error loop
    requestAnimationFrame(safeLoop); // keep loop alive
  }
}

// -- Public API ----------------------------------------------------------------

function mount(canvas, options = {}) {
  _canvas = canvas;
  _ctx = canvas.getContext('2d');
  _refreshRate = options.refreshRate ?? 60;
  _maxDelta = (1 / _refreshRate) * 2; // Rule 21

  applySurface();
  watchDPR();
  window.addEventListener('resize', onWindowResize);
  window.addEventListener('focus', revalidateRefreshRate);
  EventBus.on(EVENTS.APP_FOREGROUNDED, onAppForegrounded);

  // Context loss handling
  canvas.addEventListener('webglcontextlost', e => {
    e.preventDefault();
    EventBus.emit(EVENTS.RENDERER_CONTEXT_LOST);
    console.error('[Renderer] Canvas context lost');
  });

  canvas.addEventListener('webglcontextrestored', () => {
    EventBus.emit(EVENTS.RENDERER_CONTEXT_RESTORED);
    applySurface();
    DirtyRegions.markFull();
  });

  _running = true;
  _lastTs = null;
  _frameCount = 0;

  console.log(
    `[Renderer] mounted - ${_logicalW}x${_logicalH} @${_dpr}dpr ${_refreshRate}fps`
  );
  requestAnimationFrame(safeLoop);
}

function destroy() {
  _running = false;
  window.removeEventListener('resize', onWindowResize);
  window.removeEventListener('focus', revalidateRefreshRate);
  EventBus.off(EVENTS.APP_FOREGROUNDED, onAppForegrounded);
  clearTimeout(_resizeTimer);
  if (_dprMediaQuery && _dprListener) {
    _dprMediaQuery.removeEventListener('change', _dprListener);
  }
  _dprMediaQuery = null;
  _dprListener = null;
  _canvas = null;
  _ctx = null;
  console.log('[Renderer] destroyed');
}

function invalidate() {
  // Phase 5: DirtyRegions.mark(node.getBounds())
  // Phase 1: no-op - loop always redraws
}

export const Renderer = { mount, destroy, invalidate };
