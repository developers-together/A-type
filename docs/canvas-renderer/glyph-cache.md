# GlyphCache Specification

GlyphCache renders text via pre-computed glyph atlas instead of ctx.fillText for 10x performance improvement and pixel-perfect ligature support.

---

## State Machine

```
UNINITIALIZED → init() → BUILDING → READY
                                   ↘ ERROR (font failed)
READY → validate() → READY (no-op if valid)
                   ↘ rebuild() → BUILDING → READY
```

**During BUILDING:** Painter falls back to ctx.fillText

---

## Architecture

### One Atlas Per (Weight, Size) Pair

**Key:** `${weight}_${size}`

**Why:**
- Simple grid packing (no complex bin packing)
- Predictable memory usage
- O(1) lookup
- Easy to debug

**Not:** One giant atlas for all weights/sizes (complex packing, memory waste)

### Metrics Survive Context Loss

**Atlases:** `Map<atlasKey, { canvas, cells }>`
- Drawing surfaces
- Rebuild required on context loss

**Metrics:** `Map<cacheKey, { advance, ascent, descent }>`
- Measurements only
- Survive context loss
- Reused on rebuild (no re-measurement)

**Why separate:** Saves expensive re-measurement on rebuild

### DPR Baked Into Atlas

Atlas rendered at physical resolution (`size * dpr`), not logical.

**Rebuild required when:**
- DPR changes (display change)
- Font changes (explicit rebuild)

**Not required when:**
- Theme changes (color handled separately)
- Resize (unless DPR changes)

---

## Phase 3 Minimal Scope

```javascript
GlyphCache.init({
  sizes: [20],              // Just typing test size
  weights: [400, 600, 700], // Regular, Semibold, Bold
  color: '#d1d0c5',         // Default text color only
});
```

**Result:**
- 3 atlases (3 weights × 1 size)
- 30ms build time
- 1-2MB memory
- Single color (no tinting complexity)

**Deferred to Phase 5/6:**
- Multiple sizes (add when views need them)
- Multiple colors (add when exact colors known)
- Complex tinting (add if actually needed)

---

## Implementation

### buildAtlasForWeightSize()

```javascript
function buildAtlasForWeightSize(weight, size) {
  // Measure at logical size (no DPR multiply)
  const measureCtx = new OffscreenCanvas(1, 1).getContext('2d');
  measureCtx.font = `${weight} ${size}px "${_font}", monospace`;
  
  const allGlyphs = [..._chars, ...LIGATURES];
  const measured = allGlyphs.map(char => {
    const m = measureCtx.measureText(char);
    return {
      char,
      w: Math.ceil(m.width) + 2,
      h: Math.ceil(size * 1.5) + 2,
      advance: m.width,                    // Already logical
      ascent: m.actualBoundingBoxAscent,   // Already logical
      descent: m.actualBoundingBoxDescent, // Already logical
    };
  });
  
  // Use reduce (not spread - fails with large arrays)
  const cellW = measured.reduce((max, g) => Math.max(max, g.w), 0);
  const cellH = measured.reduce((max, g) => Math.max(max, g.h), 0);
  
  const COLS = 16;
  const rows = Math.ceil(measured.length / COLS);
  
  // Physical dimensions for atlas
  const atlasCanvas = new OffscreenCanvas(
    Math.ceil(COLS * cellW * _dpr),
    Math.ceil(rows * cellH * _dpr)
  );
  const atlasCtx = atlasCanvas.getContext('2d');
  
  // Scale once, then use logical coords
  atlasCtx.scale(_dpr, _dpr);
  atlasCtx.font = `${weight} ${size}px "${_font}", monospace`;
  atlasCtx.textBaseline = 'alphabetic';
  atlasCtx.fillStyle = '#d1d0c5'; // Default color
  
  const cells = new Map();
  
  measured.forEach(({ char, w, h, advance, ascent, descent }, i) => {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const sx = col * cellW;      // Logical
    const sy = row * cellH;      // Logical
    const baseline = sy + size;  // Logical
    
    atlasCtx.fillText(char, sx + 1, baseline);
    
    const key = cacheKey(char, size, weight);
    
    // Store physical coords for drawImage source
    cells.set(key, {
      sx: Math.round(sx * _dpr),
      sy: Math.round(sy * _dpr),
      sw: Math.ceil(cellW * _dpr),
      sh: Math.ceil(cellH * _dpr),
      advance,  // Logical
      ascent,   // Logical
      descent,  // Logical
    });
    
    _metrics.set(key, { advance, ascent, descent });
  });
  
  _atlases.set(atlasKey(weight, size), { canvas: atlasCanvas, cells });
}
```

### DPR Handling Pattern

**Consistent approach:**
- measureCtx: logical coordinates
- atlasCtx: `scale(_dpr, _dpr)` once, then logical coords
- drawImage: source physical, dest logical (divide by DPR)

```javascript
// drawImage usage:
_ctx.drawImage(
  atlas,
  glyph.sx, glyph.sy, glyph.sw, glyph.sh,     // source: physical
  Math.round(x), Math.round(y - glyph.ascent), // dest: logical
  glyph.sw / _dpr, glyph.sh / _dpr            // dest: logical (DPR divide)
);
```

### Ligature Detection

**Ligatures:** fi, fl, ff, ffi, ffl

**Index-based lookahead (not for...of):**

```javascript
function measure(text, size, weight) {
  let totalAdvance = 0;
  let i = 0;
  
  while (i < text.length) {
    let matched = false;
    
    // Check ligatures first (longest match)
    for (const lig of LIGATURES) {
      if (text.startsWith(lig, i)) {
        const key = cacheKey(lig, size, weight);
        const m = _metrics.get(key);
        if (m) {
          totalAdvance += m.advance;
          i += lig.length; // Skip ligature length
          matched = true;
          break;
        }
      }
    }
    
    if (!matched) {
      const char = text[i];
      const key = cacheKey(char, size, weight);
      const m = _metrics.get(key);
      if (m) totalAdvance += m.advance;
      i++;
    }
  }
  
  return { width: totalAdvance, ... };
}
```

**Same pattern in Painter.paintTextFromCache()**

### Color Handling (Phase 3)

**Single color approach:**
- Atlas rendered in default color: `#d1d0c5`
- Use cache if `node.color === '#d1d0c5'`
- Fallback to fillText for other colors

```javascript
function paintText(node) {
  if (GlyphCache.isReady() && node.color === '#d1d0c5') {
    paintTextFromCache(node);
  } else {
    paintTextFallback(node);
  }
}
```

**Why:** Typing test uses 3-4 colors max. Can add color-per-atlas in Phase 5/6 when exact colors known.

---

## Testing

### Ligature Detection Test

**Test code path, not visual metrics:**

```javascript
it('detects fi as ligature in difficult', () => {
  let fiCount = 0;
  const origGet = GlyphCache.get;
  GlyphCache.get = (char, size, weight) => {
    if (char === 'fi') fiCount++;
    return origGet(char, size, weight);
  };
  
  GlyphCache.measure('difficult', 20, 400);
  GlyphCache.get = origGet;
  
  expect(fiCount).toBe(1); // 'fi' in 'dif-fi-cult'
});
```

**Why:** Tests that measure() actually detects ligatures, not font metrics.

---

## Helpers

```javascript
function cacheKey(char, size, weight) {
  // \x00 separator prevents collisions
  return `${char}\x00${size}\x00${weight}`;
}

function atlasKey(weight, size) {
  return `${weight}_${size}`;
}

function yieldToUI() {
  return new Promise(resolve => setTimeout(resolve, 0));
}
```

---

## Performance

**Build:**
- 3 atlases × 10ms = 30ms total
- ~160 cells per atlas
- 1-2MB memory

**Render:**
- 0.05ms per word (10x faster than fillText)
- 0.01ms measurement

**Rebuild:**
- Triggered by DPR change only
- Same as initial build (30ms)
- Rare (only on display change)

---

## Acceptance Criteria

Phase 3 complete when:
- Ligature test passes (code path test)
- "difficult" renders with fi ligature
- Text crisp on 2x and 1x displays
- Cache rebuilds on DPR change
- Performance: <0.5ms per word line
- Fallback works for non-default colors
