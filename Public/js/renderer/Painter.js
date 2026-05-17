// Public/js/renderer/Painter.js
// Canvas drawing primitives. Owns all runtime canvas context operations.
// Rule 2: Renderer owns canvas at runtime - Painter is the only draw path.
//
// Phase 2 delivers:
//   - Static painting (no GlyphCache yet)
//   - Rect drawing with border radius
//   - Text drawing via ctx.fillText (fallback until Phase 3)
//   - Opacity and clipping support
//
// Phase 3 upgrades text rendering to use GlyphCache.
// Phase 5 adds patch-based painting.

let _ctx = null;
let _logicalW = 0;
let _logicalH = 0;

// -- Init ----------------------------------------------------------------------

function init(ctx, logicalWidth, logicalHeight) {
  _ctx = ctx;
  _logicalW = logicalWidth;
  _logicalH = logicalHeight;
}

// -- Resize (dimensions change, context unchanged) ----------------------------

function setSize(logicalWidth, logicalHeight) {
  _logicalW = logicalWidth;
  _logicalH = logicalHeight;
}

// -- Clear ---------------------------------------------------------------------

function clear(color = '#0a0a0a') {
  _ctx.fillStyle = color;
  _ctx.fillRect(0, 0, _logicalW, _logicalH);
}

// -- Paint node tree -----------------------------------------------------------

function paint(node) {
  if (!node || !node.visible) return;
  
  _ctx.save();
  
  // Apply opacity
  if (node.opacity !== undefined && node.opacity < 1) {
    _ctx.globalAlpha = node.opacity;
  }
  
  // Dispatch to type-specific painter
  switch (node.type) {
    case 'container':
      // Container has no visual representation - just paint children
      break;
    case 'rect':
      paintRect(node);
      break;
    case 'text':
      paintText(node);
      break;
    default:
      // Unknown node type - skip but paint children
      if (typeof __DEBUG__ !== 'undefined' && __DEBUG__) {
        console.warn(`[Painter] Unknown node type: ${node.type}`);
      }
      break;
  }
  
  // Paint children
  if (node.children && Array.isArray(node.children)) {
    // Sort by zIndex if present
    const sorted = [...node.children].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));
    for (const child of sorted) {
      paint(child);
    }
  }
  
  _ctx.restore();
}

// -- Rect painting -------------------------------------------------------------

function paintRect(node) {
  const { x, y, width, height, fill, stroke, strokeWidth, radius } = node;
  
  // Pixel snapping for crisp edges
  const px = Math.round(x);
  const py = Math.round(y);
  const pw = Math.round(width);
  const ph = Math.round(height);
  
  if (radius > 0) {
    // Rounded rect
    const r = Math.min(radius, pw / 2, ph / 2);
    _ctx.beginPath();
    _ctx.moveTo(px + r, py);
    _ctx.lineTo(px + pw - r, py);
    _ctx.arcTo(px + pw, py, px + pw, py + r, r);
    _ctx.lineTo(px + pw, py + ph - r);
    _ctx.arcTo(px + pw, py + ph, px + pw - r, py + ph, r);
    _ctx.lineTo(px + r, py + ph);
    _ctx.arcTo(px, py + ph, px, py + ph - r, r);
    _ctx.lineTo(px, py + r);
    _ctx.arcTo(px, py, px + r, py, r);
    _ctx.closePath();
    
    if (fill) {
      _ctx.fillStyle = fill;
      _ctx.fill();
    }
    
    if (stroke) {
      _ctx.strokeStyle = stroke;
      _ctx.lineWidth = strokeWidth ?? 1;
      _ctx.stroke();
    }
  } else {
    // Sharp rect
    if (fill) {
      _ctx.fillStyle = fill;
      _ctx.fillRect(px, py, pw, ph);
    }
    
    if (stroke) {
      _ctx.strokeStyle = stroke;
      _ctx.lineWidth = strokeWidth ?? 1;
      _ctx.strokeRect(px, py, pw, ph);
    }
  }
}

// -- Text painting (Phase 2 fallback) -----------------------------------------
// Phase 3 will replace this with GlyphCache rendering
// IMPORTANT: Painter must NOT mutate nodes - bounds computed in LayoutEngine (Phase 4)

function paintText(node) {
  const { text, x, y, font, size, weight, color, align, baseline } = node;
  
  if (!text) return;
  
  // Pixel-snapped baseline for crisp text
  const px = Math.round(x);
  const py = Math.round(y);
  
  // Build font string
  const fontStr = `${weight ?? 400} ${size ?? 16}px "${font ?? 'JetBrains Mono'}", monospace`;
  
  _ctx.font = fontStr;
  _ctx.fillStyle = color ?? '#d1d0c5';
  _ctx.textAlign = align ?? 'left';
  _ctx.textBaseline = baseline ?? 'alphabetic';
  
  _ctx.fillText(text, px, py);
  
  // Phase 4: LayoutEngine will compute bounds before paint
  // For now: bounds must be pre-computed by caller or left null
  // Painter NEVER mutates scene nodes (unidirectional flow invariant)
}

// -- Debug helpers -------------------------------------------------------------

function drawDebugBounds(node) {
  const DEBUG = typeof __DEBUG__ !== 'undefined' ? __DEBUG__ : true;
  if (!DEBUG || !node.bounds) return;
  
  const { x, y, width, height } = node.bounds;
  _ctx.strokeStyle = node.interactive ? '#e2b714' : '#ca4754';
  _ctx.lineWidth = 1;
  _ctx.strokeRect(x, y, width, height);
}

// -- Export --------------------------------------------------------------------

export const Painter = {
  init,
  setSize,
  clear,
  paint,
  drawDebugBounds,
};
