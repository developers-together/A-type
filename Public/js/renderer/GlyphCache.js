// Public/js/renderer/GlyphCache.js
// Glyph atlas cache for fast text rendering with ligature-aware measurement.

const STATE = {
  UNINITIALIZED: 0,
  BUILDING: 1,
  READY: 2,
  ERROR: 3,
};

const LIGATURES = ['ffi', 'ffl', 'fi', 'fl', 'ff'];
const DEFAULT_COLOR = '#d1d0c5';

let _state = STATE.UNINITIALIZED;
let _dpr = 1;
let _font = 'JetBrains Mono';
let _sizes = [20];
let _weights = [400, 600, 700];
let _chars = buildDefaultCharSet();
let _color = DEFAULT_COLOR;
let _onProgress = null;

// atlasKey(weight, size) -> { canvas, cells }
let _atlases = new Map();
// cacheKey(char, size, weight) -> { advance, ascent, descent }
let _metrics = new Map();

function cacheKey(char, size, weight) {
  return `${char}\x00${size}\x00${weight}`;
}

function atlasKey(weight, size) {
  return `${weight}_${size}`;
}

function yieldToUI() {
  return new Promise(resolve => setTimeout(resolve, 0));
}

function buildDefaultCharSet() {
  const chars = new Set();

  for (let i = 97; i <= 122; i++) chars.add(String.fromCharCode(i));
  for (let i = 65; i <= 90; i++) chars.add(String.fromCharCode(i));
  for (let i = 48; i <= 57; i++) chars.add(String.fromCharCode(i));

  const punct = ' .,;:!?\'"()-[]{}/@#$%^&*+=_~`|\\<>';
  for (const c of punct) chars.add(c);

  return Array.from(chars);
}

async function init(options = {}) {
  if (_state === STATE.BUILDING) {
    return;
  }

  _font = options.font ?? 'JetBrains Mono';
  _sizes = options.sizes ?? [20];
  _weights = options.weights ?? [400, 600, 700];
  _chars = options.chars ?? buildDefaultCharSet();
  _color = options.color ?? DEFAULT_COLOR;
  _onProgress = options.onProgress ?? null;
  _dpr = window.devicePixelRatio || 1;

  _state = STATE.BUILDING;
  _atlases.clear();
  _metrics.clear();

  try {
    await buildAtlases();
    _state = STATE.READY;
  } catch (err) {
    _state = STATE.ERROR;
    console.error('[GlyphCache] build failed:', err);
    throw err;
  }
}

async function buildAtlases() {
  const total = _weights.length * _sizes.length;
  let done = 0;

  for (const weight of _weights) {
    for (const size of _sizes) {
      buildAtlasForWeightSize(weight, size);
      done++;
      if (_onProgress) {
        _onProgress(done, total);
      }
      await yieldToUI();
    }
  }
}

function buildAtlasForWeightSize(weight, size) {
  const measureCanvas = new OffscreenCanvas(1, 1);
  const measureCtx = measureCanvas.getContext('2d');
  measureCtx.font = `${weight} ${size}px "${_font}", monospace`;
  measureCtx.textBaseline = 'alphabetic';

  const allGlyphs = [..._chars, ...LIGATURES];
  const measured = allGlyphs.map(char => {
    const m = measureCtx.measureText(char);
    return {
      char,
      w: Math.ceil(m.width) + 2,
      h: Math.ceil(size * 1.5) + 2,
      advance: m.width,
      ascent: m.actualBoundingBoxAscent ?? size * 0.8,
      descent: m.actualBoundingBoxDescent ?? size * 0.2,
    };
  });

  const cellW = measured.reduce((max, g) => Math.max(max, g.w), 0);
  const cellH = measured.reduce((max, g) => Math.max(max, g.h), 0);

  const COLS = 16;
  const rows = Math.ceil(measured.length / COLS);

  const atlasCanvas = new OffscreenCanvas(
    Math.ceil(COLS * cellW * _dpr),
    Math.ceil(rows * cellH * _dpr)
  );
  const atlasCtx = atlasCanvas.getContext('2d');
  atlasCtx.scale(_dpr, _dpr);
  atlasCtx.font = `${weight} ${size}px "${_font}", monospace`;
  atlasCtx.textBaseline = 'alphabetic';
  atlasCtx.fillStyle = DEFAULT_COLOR;

  const cells = new Map();

  measured.forEach(({ char, advance, ascent, descent }, i) => {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const sx = col * cellW;
    const sy = row * cellH;
    const baseline = Math.round((sy + size) * _dpr) / _dpr;
    const drawX = Math.round((sx + 1) * _dpr) / _dpr;

    atlasCtx.fillText(char, drawX, baseline);

    const key = cacheKey(char, size, weight);
    const cell = {
      sx: Math.round(sx * _dpr),
      sy: Math.round(sy * _dpr),
      sw: Math.ceil(cellW * _dpr),
      sh: Math.ceil(cellH * _dpr),
      advance,
      ascent,
      descent,
    };

    cells.set(key, cell);
    _metrics.set(key, { advance, ascent, descent });
  });

  _atlases.set(atlasKey(weight, size), { canvas: atlasCanvas, cells });
}

function get(char, size, weight = 400) {
  if (_state !== STATE.READY) return null;

  const atlas = _atlases.get(atlasKey(weight, size));
  if (!atlas) return null;

  const cell = atlas.cells.get(cacheKey(char, size, weight));
  if (!cell) return null;

  return {
    atlas: atlas.canvas,
    ...cell,
  };
}

function measure(text, size, weight = 400) {
  if (_state !== STATE.READY) return null;

  let width = 0;
  let ascent = 0;
  let descent = 0;
  let i = 0;

  while (i < text.length) {
    let matched = false;

    for (const lig of LIGATURES) {
      if (text.startsWith(lig, i)) {
        const glyph = GlyphCache.get(lig, size, weight);
        if (glyph) {
          width += glyph.advance;
          ascent = Math.max(ascent, glyph.ascent);
          descent = Math.max(descent, glyph.descent);
          i += lig.length;
          matched = true;
          break;
        }
      }
    }

    if (!matched) {
      const glyph = GlyphCache.get(text[i], size, weight);
      if (glyph) {
        width += glyph.advance;
        ascent = Math.max(ascent, glyph.ascent);
        descent = Math.max(descent, glyph.descent);
      }
      i++;
    }
  }

  return {
    width,
    height: ascent + descent,
    ascent,
    descent,
  };
}

function validate() {
  if (_state !== STATE.READY) return false;
  const currentDpr = window.devicePixelRatio || 1;
  return Math.abs(currentDpr - _dpr) <= 0.01;
}

async function rebuild() {
  if (_state === STATE.BUILDING) return;
  await init({
    font: _font,
    sizes: _sizes,
    weights: _weights,
    chars: _chars,
    color: _color,
    onProgress: _onProgress,
  });
}

function isReady() {
  return _state === STATE.READY;
}

export const GlyphCache = {
  init,
  get,
  measure,
  validate,
  rebuild,
  isReady,
};
