// Public/js/tests/LayoutEngine.test.js
// Tests for LayoutEngine.js bounds computation and invalidation behavior.

import { describe, it, expect } from './runner.js';
import { LayoutEngine } from '../renderer/LayoutEngine.js';
import { GlyphCache } from '../renderer/GlyphCache.js';

function makeTextNode(overrides = {}) {
  return {
    type: 'text',
    text: 'hello',
    x: 100,
    y: 50,
    size: 20,
    weight: 400,
    bounds: null,
    children: [],
    ...overrides,
  };
}

function makeRectNode(overrides = {}) {
  return {
    type: 'rect',
    x: 10,
    y: 20,
    width: 40,
    height: 30,
    bounds: { x: 10, y: 20, width: 40, height: 30 },
    children: [],
    ...overrides,
  };
}

function makeRoot(children) {
  return { type: 'container', id: 'root', children };
}

export function layoutEngineTests() {
  describe('LayoutEngine', () => {
    it('layout() sets bounds on text nodes when GlyphCache is ready', () => {
      const originalIsReady = GlyphCache.isReady;
      const originalMeasure = GlyphCache.measure;
      try {
        GlyphCache.isReady = () => true;
        GlyphCache.measure = () => ({ width: 80, height: 24, ascent: 16, descent: 8 });

        const text = makeTextNode({ bounds: null });
        const root = makeRoot([text]);
        LayoutEngine.invalidateAll();
        LayoutEngine.layout(root);

        expect(text.bounds).toEqual({ x: 100, y: 34, width: 80, height: 24 });
      } finally {
        GlyphCache.isReady = originalIsReady;
        GlyphCache.measure = originalMeasure;
      }
    });

    it('layout() skips text nodes when GlyphCache is not ready (no throw)', () => {
      const originalIsReady = GlyphCache.isReady;
      try {
        GlyphCache.isReady = () => false;
        const text = makeTextNode();
        const root = makeRoot([text]);
        LayoutEngine.invalidateAll();

        let threw = false;
        try {
          LayoutEngine.layout(root);
        } catch (_err) {
          threw = true;
        }

        expect(threw).toBeFalsy();
        expect(text.bounds).toBe(null);
      } finally {
        GlyphCache.isReady = originalIsReady;
      }
    });

    it('layout() does not overwrite existing bounds on rect nodes if already set', () => {
      const rect = makeRectNode({ bounds: { x: 1, y: 2, width: 3, height: 4 } });
      const root = makeRoot([rect]);
      LayoutEngine.invalidateAll();
      LayoutEngine.layout(root);
      expect(rect.bounds).toEqual({ x: 1, y: 2, width: 3, height: 4 });
    });

    it('invalidateAll() causes layout() to re-traverse on next call', () => {
      const originalIsReady = GlyphCache.isReady;
      const originalMeasure = GlyphCache.measure;
      let measureCount = 0;
      try {
        GlyphCache.isReady = () => true;
        GlyphCache.measure = () => {
          measureCount++;
          return { width: 10, height: 10, ascent: 7, descent: 3 };
        };

        const text = makeTextNode();
        const root = makeRoot([text]);

        LayoutEngine.invalidateAll();
        LayoutEngine.layout(root); // first traverse
        LayoutEngine.layout(root); // skipped clean
        LayoutEngine.invalidateAll();
        LayoutEngine.layout(root); // traverse again

        expect(measureCount).toBe(2);
      } finally {
        GlyphCache.isReady = originalIsReady;
        GlyphCache.measure = originalMeasure;
      }
    });

    it('computeBounds() returns null for container nodes', () => {
      const container = { type: 'container', children: [] };
      expect(LayoutEngine.computeBounds(container, null)).toBe(null);
    });
  });
}
