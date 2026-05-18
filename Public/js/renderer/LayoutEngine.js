// Public/js/renderer/LayoutEngine.js
// Minimal Phase 4 layout engine: computes node bounds before paint.

import { GlyphCache } from './GlyphCache.js';

let _dirty = true;
let _warnedGlyphNotReady = false;

function init() {
  // Phase 4 minimal scope: no setup required yet.
}

function computeBounds(node, _ctx) {
  if (!node) return null;

  if (node.type === 'container') {
    return null;
  }

  if (node.type === 'rect') {
    if (node.bounds) return node.bounds;
    const bounds = {
      x: node.x ?? 0,
      y: node.y ?? 0,
      width: node.width ?? 0,
      height: node.height ?? 0,
    };
    node.bounds = bounds;
    return bounds;
  }

  if (node.type === 'text') {
    if (!GlyphCache.isReady()) {
      node.bounds = null;
      return null;
    }

    const metrics = GlyphCache.measure(node.text ?? '', node.size ?? 16, node.weight ?? 400);
    if (!metrics) {
      node.bounds = null;
      return null;
    }

    const bounds = {
      x: node.x ?? 0,
      y: (node.y ?? 0) - metrics.ascent,
      width: metrics.width,
      height: metrics.height,
    };
    node.bounds = bounds;
    return bounds;
  }

  return null;
}

function needsBounds(node) {
  return node && (node.type === 'text' || node.type === 'rect');
}

function hasNullBounds(node) {
  if (!node) return false;
  if (needsBounds(node) && node.bounds == null) return true;
  if (!node.children || !Array.isArray(node.children)) return false;
  for (const child of node.children) {
    if (hasNullBounds(child)) return true;
  }
  return false;
}

function traverseDepthFirst(node, fn) {
  if (!node) return;
  fn(node);
  if (node.children && Array.isArray(node.children)) {
    for (const child of node.children) {
      traverseDepthFirst(child, fn);
    }
  }
}

function layout(root) {
  if (!root) return;

  if (!_dirty && !hasNullBounds(root)) {
    return;
  }

  if (!GlyphCache.isReady() && !_warnedGlyphNotReady) {
    console.warn('[LayoutEngine] GlyphCache not ready - text bounds set to null');
    _warnedGlyphNotReady = true;
  }

  if (GlyphCache.isReady()) {
    _warnedGlyphNotReady = false;
  }

  traverseDepthFirst(root, node => {
    if (!needsBounds(node)) return;
    computeBounds(node, null);
  });

  _dirty = false;
}

function invalidateAll() {
  _dirty = true;
  console.log('[LayoutEngine] invalidated');
}

export const LayoutEngine = {
  init,
  computeBounds,
  layout,
  invalidateAll,
};
