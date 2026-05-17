// Public/js/renderer/GlyphCache.js
// Glyph atlas cache. Maps (char, size, weight) → atlas position.
// ONE atlas canvas per weight. All atlases are DPR-aware.
//
// State machine:
//   UNINITIALIZED → init() → BUILDING → READY
//                                     ↘ ERROR (font failed)
//   READY → rebuild() → BUILDING → READY
//   READY → validate() → READY (no-op if valid) | → rebuild()
//
// Rules:
//   - GlyphCache never reads from the main canvas context
//   - All atlas draws happen on dedicated OffscreenCanvas per weight
//   - Cache key: `${char}_${size}_${weight}`
//   - DPR baked into atlas at build time (rebuild required on DPR change)
//   - During BUILDING state: Painter.paintText() falls back to ctx.fillText()
//
// Phase 3 delivers:
//   - Per-weight atlas building
//   - Glyph measurement with ligature support
//   - DPR-aware atlas sizing
//   - Cache validation on resize
//   - Rebuild on font/DPR change

const STATE = {
  UNINITIALIZED: 0,
  BUILDING: 1,
  READY: 2,
  ERROR: 3,
};

// -- State --------------------------------------------------------------------

let _state = STATE.UNINITIALIZED;
let _dpr = 1;
let _font = 'JetBrains Mono';
let _sizes = [12, 14, 16, 18, 20, 24, 32]; // Common sizes
let _weights = [400, 600, 700]; // Regular, Semibold, Bold
let _chars = ''; // All chars to cache
let _onProgress = null;

// Atlas storage: weight → { canvas, ctx, cells: Map<char_size, {x,y,w,h}> }
let _atlases = new Map();

// Metrics storage: key → { advance, ascent, descent }
// Survives context loss - only atlas canvases need rebuild
let _metrics = new Map();

// Ligatures to handle
const LIGATURES = ['fi', 'fl', 'ff', 'ffi', 'ffl'];

// -- Init ---------------------------------------------------------------------

function init(options = {}) {
  if (_state === STATE.BUILDING) {
    console.warn('[GlyphCache] init() called while BUILDING - ignoring');
    return;
  }

  _font = options.font ?? 'JetBrains Mono';
  _sizes = options.sizes ?? [12, 14, 16, 18, 20, 24, 32];
  _weights = options.weights ?? [400, 600, 700];
  _chars = options.chars ?? buildDefaultCharSet();
  _onProgress = options.onProgress ?? null;
  _dpr = window.devicePixelRatio || 1;

  _state = STATE.BUILDING;
  _atlases.clear();
  _metrics.clear();

  console.log(`[GlyphCache] init - font:${_font} dpr:${_dpr} weights:${_weights.length} sizes:${_sizes.length} chars:${_chars.length}`);

  // Build atlases asynchronously
  buildAtlases()
    .then(() => {
      _state = STATE.READY;
      console.log('[GlyphCache] ready');
    })
    .catch(err => {
      _state = STATE.ERROR;
      console.error('[GlyphCache] build failed:', err);
    });
}

// -- Build default character set ----------------------------------------------

function buildDefaultCharSet() {
  const chars = new Set();

  // a-z
  for (let i = 97; i <= 122; i++) chars.add(String.fromCharCode(i));
  // A-Z
  for (let i = 65; i <= 90; i++) chars.add(String.fromCharCode(i));
  // 0-9
  for (let i = 48; i <= 57; i++) chars.add(String.fromCharCode(i));
  // Common punctuation
  const punct = ' .,;:!?\'"()-[]{}/@#$%^&*+=_~`|\\<>';
  for (const c of punct) chars.add(c);

  // Ligatures
  for (const lig of LIGATURES) chars.add(lig);

  return Array.from(chars).join('');
}

// -- Build atlases ------------------------------------------------------------

async function buildAtlases() {
  const totalSteps = _weights.length;
  let completed = 0;

  for (const weight of _weights) {
    await buildAtlasForWeight(weight);
    completed++;
    if (_onProgress) {
      _onProgress(completed, totalSteps);
    }
  }
}

async function buildAtlasForWeight(weight) {
  // Phase 3: Implement atlas packing
  // For now: stub that creates empty atlas
  
  // Estimate atlas size based on char count and max size
  const maxSize = Math.max(..._sizes);
  const cellSize = Math.ceil(maxSize * _dpr * 1.5); // padding for descenders
  const cols = Math.ceil(Math.sqrt(_chars.length * _sizes.length));
  const atlasWidth = cols * cellSize;
  const atlasHeight = cols * cellSize;

  // Create offscreen canvas for this weight
  const canvas = new OffscreenCanvas(atlasWidth, atlasHeight);
  const ctx = canvas.getContext('2d');

  // Store atlas
  _atlases.set(weight, {
    canvas,
    ctx,
    cells: new Map(),
    width: atlasWidth,
    height: atlasHeight,
  });

  // Phase 3: Render all glyphs to atlas and store metrics
  // For now: just log
  console.log(`[GlyphCache] built atlas for weight ${weight}: ${atlasWidth}x${atlasHeight}`);
}

// -- Get glyph from cache -----------------------------------------------------

function get(char, size, weight = 400) {
  if (_state !== STATE.READY) return null;

  const key = `${char}_${size}_${weight}`;
  const atlas = _atlases.get(weight);
  
  if (!atlas) return null;

  const cell = atlas.cells.get(key);
  if (!cell) return null;

  return {
    atlas: atlas.canvas,
    ...cell,
  };
}

// -- Measure text -------------------------------------------------------------

function measure(text, size, weight = 400) {
  if (_state !== STATE.READY) return null;

  let totalAdvance = 0;
  let maxAscent = 0;
  let maxDescent = 0;

  // Phase 3: Implement ligature-aware measurement
  // For now: simple char-by-char
  for (const char of text) {
    const key = `${char}_${size}_${weight}`;
    const metrics = _metrics.get(key);
    
    if (metrics) {
      totalAdvance += metrics.advance;
      maxAscent = Math.max(maxAscent, metrics.ascent);
      maxDescent = Math.max(maxDescent, metrics.descent);
    }
  }

  return {
    width: totalAdvance,
    height: maxAscent + maxDescent,
    ascent: maxAscent,
    descent: maxDescent,
  };
}

// -- Validate cache -----------------------------------------------------------

function validate() {
  if (_state !== STATE.READY) return false;

  const currentDpr = window.devicePixelRatio || 1;
  
  // Rebuild required if DPR changed
  if (Math.abs(currentDpr - _dpr) > 0.01) {
    console.log(`[GlyphCache] DPR changed ${_dpr} → ${currentDpr}, rebuild required`);
    return false;
  }

  // Phase 3: Add font validation (check if font still loaded)
  
  return true;
}

// -- Rebuild cache ------------------------------------------------------------

function rebuild() {
  if (_state === STATE.BUILDING) {
    console.warn('[GlyphCache] rebuild() called while BUILDING - ignoring');
    return;
  }

  console.log('[GlyphCache] rebuild triggered');
  
  // Re-init with current settings
  init({
    font: _font,
    sizes: _sizes,
    weights: _weights,
    chars: _chars,
    onProgress: _onProgress,
  });
}

// -- State queries ------------------------------------------------------------

function isReady() {
  return _state === STATE.READY;
}

function getState() {
  return _state;
}

// -- Export -------------------------------------------------------------------

export const GlyphCache = {
  init,
  get,
  measure,
  validate,
  rebuild,
  isReady,
  getState,
  STATE, // Export for tests
};
