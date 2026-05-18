// Public/js/tests/ResponsiveConfig.test.js
// Tests for ResponsiveConfig.js breakpoint selection and validation.

import { describe, it, expect } from './runner.js';
import { ResponsiveConfig } from '../renderer/ResponsiveConfig.js';

function withInnerWidth(width, fn) {
  const originalDescriptor = Object.getOwnPropertyDescriptor(window, 'innerWidth');
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: width });
  try {
    return fn();
  } finally {
    if (originalDescriptor) {
      Object.defineProperty(window, 'innerWidth', originalDescriptor);
    } else {
      delete window.innerWidth;
    }
  }
}

export function responsiveConfigTests() {
  describe('ResponsiveConfig', () => {
    it('validateConfig() does not throw with valid config', () => {
      let threw = false;
      try {
        ResponsiveConfig.validateConfig();
      } catch (_err) {
        threw = true;
      }
      expect(threw).toBeFalsy();
    });

    it("getBreakpoint() returns 'lg' for width 1188", () => {
      withInnerWidth(1188, () => {
        expect(ResponsiveConfig.getBreakpoint()).toBe('lg');
      });
    });

    it("getBreakpoint() returns 'xs' for width 320", () => {
      withInnerWidth(320, () => {
        expect(ResponsiveConfig.getBreakpoint()).toBe('xs');
      });
    });

    it("getBreakpoint() returns 'xxl' for width 2560", () => {
      withInnerWidth(2560, () => {
        expect(ResponsiveConfig.getBreakpoint()).toBe('xxl');
      });
    });

    it('getConfig() returns object with all required keys', () => {
      withInnerWidth(1188, () => {
        const cfg = ResponsiveConfig.getConfig();
        expect(typeof cfg).toBe('object');
        expect(cfg !== null).toBeTruthy();
        expect('minW' in cfg).toBeTruthy();
        expect('fontSize' in cfg).toBeTruthy();
        expect('lineHeight' in cfg).toBeTruthy();
        expect('visibleLines' in cfg).toBeTruthy();
        expect('maxContentWidth' in cfg).toBeTruthy();
      });
    });
  });
}
