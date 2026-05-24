// Public/js/renderer/DirtyRegions.js
// Merges dirty patch rects into a minimal set of non-overlapping regions.
// If the merged region count exceeds MAX_PATCHES, signals full repaint.
//
// Invariant 11: rect pool for zero hot-path allocation after warmup.

const MAX_PATCHES = 8;   // above this, full repaint is cheaper than clipping N regions

// -- Rect pool -----------------------------------------------------------------

const _rectPool = [];
let _poolHits = 0;
let _poolMisses = 0;

function acquireRect() {
  if (_rectPool.length > 0) {
    _poolHits++;
    return _rectPool.pop();
  }
  _poolMisses++;
  return { x: 0, y: 0, width: 0, height: 0 };
}

function releaseRect(rect) {
  rect.x = 0;
  rect.y = 0;
  rect.width = 0;
  rect.height = 0;
  _rectPool.push(rect);
}

// -- State ---------------------------------------------------------------------

let _regions = [];          // merged dirty regions for current frame
let _fullRepaint = false;   // true when patch budget exceeded

// -- Merge logic ---------------------------------------------------------------

/**
 * Check if two rects overlap (touching counts as overlapping).
 */
function overlaps(a, b) {
  return !(
    a.x + a.width  < b.x ||
    b.x + b.width  < a.x ||
    a.y + a.height < b.y ||
    b.y + b.height < a.y
  );
}

/**
 * Expand rect a to also cover rect b. Mutates a.
 */
function expandToFit(a, b) {
  const x2 = Math.max(a.x + a.width,  b.x + b.width);
  const y2 = Math.max(a.y + a.height, b.y + b.height);
  a.x      = Math.min(a.x, b.x);
  a.y      = Math.min(a.y, b.y);
  a.width  = x2 - a.x;
  a.height = y2 - a.y;
}

/**
 * Add a padding of 1px to each rect to cover anti-aliasing fringe.
 * Mutates in place.
 */
function padRect(r, logicalW, logicalH) {
  r.x      = Math.max(0, r.x - 1);
  r.y      = Math.max(0, r.y - 1);
  r.width  = Math.min(logicalW - r.x, r.width  + 2);
  r.height = Math.min(logicalH - r.y, r.height + 2);
}

// -- Public API ----------------------------------------------------------------

/**
 * Compute merged dirty regions from a patch list (output of Differ.diff()).
 * Clamps to canvas bounds. Sets _fullRepaint if region count > MAX_PATCHES.
 *
 * @param {Array<{x,y,width,height}>} patches
 * @param {number} logicalW
 * @param {number} logicalH
 */
function compute(patches, logicalW, logicalH) {
  // Release previous frame's regions
  for (const r of _regions) releaseRect(r);
  _regions.length = 0;
  _fullRepaint = false;

  if (patches.length === 0) return;

  // Seed with first patch
  for (const patch of patches) {
    if (patch.width <= 0 || patch.height <= 0) continue;

    let merged = false;
    for (const region of _regions) {
      if (overlaps(region, patch)) {
        expandToFit(region, patch);
        merged = true;
        break;
      }
    }

    if (!merged) {
      const r = acquireRect();
      r.x      = patch.x;
      r.y      = patch.y;
      r.width  = patch.width;
      r.height = patch.height;
      _regions.push(r);
    }

    // Budget check — bail early to full repaint
    if (_regions.length > MAX_PATCHES) {
      _fullRepaint = true;
      for (const r of _regions) releaseRect(r);
      _regions.length = 0;
      return;
    }
  }

  // Pad each region for anti-aliasing fringe
  for (const r of _regions) {
    padRect(r, logicalW, logicalH);
  }
}

/**
 * True if patch budget was exceeded — caller should do full repaint.
 */
function needsFullRepaint() {
  return _fullRepaint;
}

/**
 * The merged dirty regions for this frame. Do not mutate.
 */
function getRegions() {
  return _regions;
}

/**
 * Release all regions back to pool (call after paint).
 */
function reset() {
  for (const r of _regions) releaseRect(r);
  _regions.length = 0;
  _fullRepaint = false;
}

/**
 * Pool metrics for Profiler.
 */
function poolMetrics() {
  return { hits: _poolHits, misses: _poolMisses, poolSize: _rectPool.length };
}

// -- Export --------------------------------------------------------------------

export const DirtyRegions = {
  compute,
  needsFullRepaint,
  getRegions,
  reset,
  poolMetrics,
};
