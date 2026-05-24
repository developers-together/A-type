// Public/js/renderer/LayoutEngine.js
// Minimal Phase 4 layout engine: computes node bounds before paint.

import { GlyphCache } from './GlyphCache.js';

let _dirty = true;
let _warnedGlyphNotReady = false;

function init() {
  // Phase 4 minimal scope: no setup required yet.
}

function layoutKey(node) {
  if (!node) return '';

  if (node.type === 'text') {
    return [
      node.type,
      node.x ?? 0,
      node.y ?? 0,
      node.text ?? '',
      node.size ?? 16,
      node.weight ?? 400,
      node.font ?? 'JetBrains Mono',
      node.align ?? 'left',
      node.baseline ?? 'alphabetic',
    ].join('|');
  }

  if (node.type === 'rect' || node.type === 'scroll-container') {
    return [
      node.type,
      node.x ?? 0,
      node.y ?? 0,
      node.width ?? 0,
      node.height ?? 0,
      node.scrollOffset ?? 0,
    ].join('|');
  }

  return node.type ?? '';
}

function textBoundsX(x, align, width) {
  const textAlign = align ?? 'left';
  if (textAlign === 'center') return x - width / 2;
  if (textAlign === 'right' || textAlign === 'end') return x - width;
  return x;
}

function textBoundsY(y, baseline, metrics) {
  const textBaseline = baseline ?? 'alphabetic';

  switch (textBaseline) {
    case 'top':
    case 'hanging':
      return y;
    case 'middle':
      return y - metrics.height / 2;
    case 'bottom':
    case 'ideographic':
      return y - metrics.height;
    case 'alphabetic':
    default:
      return y - metrics.ascent;
  }
}

function measureTextFallback(node) {
  const text = node.text ?? '';
  if (!text) {
    return { width: 0, height: 0, ascent: 0, descent: 0 };
  }

  if (typeof OffscreenCanvas === 'undefined') {
    return null;
  }

  const size = node.size ?? 16;
  const weight = node.weight ?? 400;
  const font = node.font ?? 'JetBrains Mono';
  const canvas = new OffscreenCanvas(1, 1);
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.font = `${weight} ${size}px "${font}", monospace`;
  ctx.textBaseline = 'alphabetic';

  const metrics = ctx.measureText(text);
  const ascent = metrics.actualBoundingBoxAscent ?? size * 0.8;
  const descent = metrics.actualBoundingBoxDescent ?? size * 0.2;

  return {
    width: metrics.width,
    height: ascent + descent,
    ascent,
    descent,
  };
}

function preserveInitialBoundsIfExternal(node, key) {
  if (node.bounds && node._layoutKey === undefined) {
    node._layoutKey = key;
    return node.bounds;
  }
  return null;
}

function computeBounds(node, _ctx, force = false) {
  if (!node) return null;

  if (node.type === 'container') {
    return null;
  }

  const key = layoutKey(node);
  const externalBounds = preserveInitialBoundsIfExternal(node, key);
  if (externalBounds) return externalBounds;

  if (!force && node.bounds && node._layoutKey === key) {
    return node.bounds;
  }

  if (node.type === 'rect') {
    const bounds = {
      x: node.x ?? 0,
      y: node.y ?? 0,
      width: node.width ?? 0,
      height: node.height ?? 0,
    };
    node.bounds = bounds;
    node._layoutKey = key;
    return bounds;
  }

  if (node.type === 'scroll-container') {
    const bounds = {
      x: node.x ?? 0,
      y: node.y ?? 0,
      width: node.width ?? 0,
      height: node.height ?? 0,
    };
    node.bounds = bounds;
    node._layoutKey = key;
    return bounds;
  }

  if (node.type === 'text') {
    if (!GlyphCache.isReady()) {
      node.bounds = null;
      node._layoutKey = key;
      return null;
    }

    let metrics = GlyphCache.measure(node.text ?? '', node.size ?? 16, node.weight ?? 400);
    if (!metrics || ((node.text ?? '') && (metrics.width <= 0 || metrics.height <= 0))) {
      metrics = measureTextFallback(node);
    }

    if (!metrics) {
      node.bounds = null;
      node._layoutKey = key;
      return null;
    }

    const bounds = {
      x: textBoundsX(node.x ?? 0, node.align, metrics.width),
      y: textBoundsY(node.y ?? 0, node.baseline, metrics),
      width: metrics.width,
      height: metrics.height,
    };
    node.bounds = bounds;
    node._layoutKey = key;
    return bounds;
  }

  return null;
}

function hasLayoutChanges(root) {
  let changed = false;

  traverseDepthFirst(root, node => {
    if (changed || !needsBounds(node)) return;
    if (!node.bounds) {
      changed = true;
      return;
    }
    if (node._layoutKey !== undefined && node._layoutKey !== layoutKey(node)) {
      changed = true;
    }
  });

  return changed;
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

  const force = _dirty;
  if (!force && !hasLayoutChanges(root)) return;

  if (!GlyphCache.isReady() && !_warnedGlyphNotReady) {
    console.warn('[LayoutEngine] GlyphCache not ready - text bounds set to null');
    _warnedGlyphNotReady = true;
  }

  if (GlyphCache.isReady()) {
    _warnedGlyphNotReady = false;
  }

  traverseDepthFirst(root, node => {
    if (!needsBounds(node)) return;
    computeBounds(node, null, force);
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
