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

  if (node.type === 'scroll-container') {
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
  return node && (node.type === 'text' || node.type === 'rect' || node.type === 'scroll-container');
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

  // Clean-frame short-circuit: trust that layout() sets bounds correctly.
  // hasNullBounds() must not run in the hot path — it walks the entire tree every frame.
  if (!_dirty) return;

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

  // Layout scroll-container children after computing their bounds
  traverseDepthFirst(root, node => {
    if (node.type === 'scroll-container') {
      layoutScrollContainer(node);
    }
  });

  _dirty = false;
}

function layoutScrollContainer(node) {
  // Stack children top-to-bottom inside the scroll container.
  // Children receive absolute canvas coordinates, offset by -scrollOffset.
  let cursor = node.y - node.scrollOffset;
  let totalHeight = 0;

  for (const child of (node.children ?? [])) {
    child.x = node.x;
    child.y = cursor;
    child.width = node.width;
    child.bounds = null;
    computeBounds(child, null);

    const childHeight = child.height ?? 0;
    cursor      += childHeight + (child.marginBottom ?? 0);
    totalHeight += childHeight + (child.marginBottom ?? 0);
  }

  node.contentHeight = totalHeight;
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
