// Public/js/tests/GlyphCache.test.js
// Tests for GlyphCache.js atlas and ligature behavior

import { describe, it, expect } from './runner.js';
import { GlyphCache } from '../renderer/GlyphCache.js';

const ORIGINAL_DPR = window.devicePixelRatio || 1;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForReady(timeoutMs = 3000) {
  const start = Date.now();
  while (!GlyphCache.isReady()) {
    if (Date.now() - start > timeoutMs) {
      throw new Error('GlyphCache did not reach READY state');
    }
    await sleep(10);
  }
}

export function glyphCacheTests() {
  describe('GlyphCache', () => {
    it('isReady() returns false before init', () => {
      expect(GlyphCache.isReady()).toBeFalsy();
    });

    it('get() returns null when not ready', () => {
      expect(GlyphCache.get('a', 20, 400)).toBe(null);
    });

    it('isReady() returns true after build', async () => {
      await GlyphCache.init({
        sizes: [20],
        weights: [400, 600, 700],
        color: '#d1d0c5',
      });
      await waitForReady();
      expect(GlyphCache.isReady()).toBeTruthy();
    });

    it('detects fi ligature in fiscal', async () => {
      await waitForReady();
      let fiCount = 0;
      const origGet = GlyphCache.get;
      try {
        GlyphCache.get = (char, size, weight) => {
          if (char === 'fi') fiCount++;
          return origGet(char, size, weight);
        };
        GlyphCache.measure('fiscal', 20, 400);
      } finally {
        GlyphCache.get = origGet;
      }
      expect(fiCount).toBe(1);
    });

    it('detects ffi ligature in difficult', async () => {
      await waitForReady();
      let ffiCount = 0;
      const origGet = GlyphCache.get;
      try {
        GlyphCache.get = (char, size, weight) => {
          if (char === 'ffi') ffiCount++;
          return origGet(char, size, weight);
        };
        GlyphCache.measure('difficult', 20, 400);
      } finally {
        GlyphCache.get = origGet;
      }
      expect(ffiCount).toBe(1);
    });

    it('validate() returns false after DPR changes', async () => {
      await waitForReady();
      const originalValue = window.devicePixelRatio;
      try {
        Object.defineProperty(window, 'devicePixelRatio', {
          configurable: true,
          value: originalValue + 1,
        });
        expect(GlyphCache.validate()).toBeFalsy();
      } finally {
        Object.defineProperty(window, 'devicePixelRatio', {
          configurable: true,
          value: ORIGINAL_DPR,
        });
      }
    });
  });
}
