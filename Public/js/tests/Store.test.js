// Public/js/tests/Store.test.js
// Tests for Store.js localStorage-backed reactive store

import { describe, it, expect } from './runner.js';
import { Store } from '../core/Store.js';

export function storeTests() {
  describe('Store', () => {
    it('init() sets defaults when localStorage is empty', () => {
      localStorage.clear();
      Store.reset();
      localStorage.clear();
      Store.init();
      
      expect(Store.get('theme')).toBe('midnight');
      expect(Store.get('mode')).toBe('time');
      expect(Store.get('duration')).toBe(30);
      expect(Store.get('wordCount')).toBe(25);
      expect(Store.get('punctuation')).toBe(false);
      expect(Store.get('numbers')).toBe(false);
      expect(Store.get('volume')).toBe(0.5);
    });

    it('init() restores valid persisted values', () => {
      localStorage.clear();
      Store.reset();
      // Persist valid values
      localStorage.setItem('atype_settings', JSON.stringify({
        theme: 'custom',
        mode: 'words',
        duration: 60,
        wordCount: 50,
        punctuation: true,
        numbers: true,
        volume: 0.8,
      }));
      
      Store.init();
      
      expect(Store.get('theme')).toBe('custom');
      expect(Store.get('mode')).toBe('words');
      expect(Store.get('duration')).toBe(60);
      expect(Store.get('wordCount')).toBe(50);
      expect(Store.get('punctuation')).toBe(true);
      expect(Store.get('numbers')).toBe(true);
      expect(Store.get('volume')).toBe(0.8);
    });

    it('init() falls back to default on invalid persisted value', () => {
      localStorage.clear();
      Store.reset();
      // Persist invalid values
      localStorage.setItem('atype_settings', JSON.stringify({
        mode: 'invalid',      // invalid mode
        duration: 999,        // invalid duration
        wordCount: 'fifty',   // invalid type
        volume: 2.5,          // out of range
      }));
      
      Store.init();
      
      // Should fall back to defaults for invalid values
      expect(Store.get('mode')).toBe('time');
      expect(Store.get('duration')).toBe(30);
      expect(Store.get('wordCount')).toBe(25);
      expect(Store.get('volume')).toBe(0.5);
    });

    it('set() persists to localStorage', () => {
      localStorage.clear();
      Store.reset();
      Store.init();
      Store.set('mode', 'words');
      
      const stored = JSON.parse(localStorage.getItem('atype_settings'));
      expect(stored.mode).toBe('words');
    });

    it('set() notifies subscribers', () => {
      localStorage.clear();
      Store.reset();
      Store.init();
      
      let notified = false;
      let receivedNew = null;
      let receivedOld = null;
      
      Store.subscribe('mode', (newVal, oldVal) => {
        notified = true;
        receivedNew = newVal;
        receivedOld = oldVal;
      });
      
      Store.set('mode', 'words');
      
      expect(notified).toBeTruthy();
      expect(receivedNew).toBe('words');
      expect(receivedOld).toBe('time');
    });

    it('set() does not notify if value unchanged', () => {
      localStorage.clear();
      Store.reset();
      Store.init();
      
      let notifyCount = 0;
      Store.subscribe('mode', () => {
        notifyCount++;
      });
      
      Store.set('mode', 'time'); // same as default
      
      expect(notifyCount).toBe(0);
    });

    it('subscribe() returns working unsubscribe function', () => {
      localStorage.clear();
      Store.reset();
      Store.init();
      
      let notifyCount = 0;
      const unsubscribe = Store.subscribe('mode', () => {
        notifyCount++;
      });
      
      Store.set('mode', 'words');
      expect(notifyCount).toBe(1);
      
      unsubscribe();
      
      Store.set('mode', 'time');
      expect(notifyCount).toBe(1); // still 1, not 2
    });

    it('reset() restores all defaults', () => {
      localStorage.clear();
      Store.reset();
      Store.init();
      
      // Change some values
      Store.set('mode', 'words');
      Store.set('duration', 60);
      Store.set('punctuation', true);
      
      // Reset
      Store.reset();
      
      // All should be back to defaults
      expect(Store.get('mode')).toBe('time');
      expect(Store.get('duration')).toBe(30);
      expect(Store.get('punctuation')).toBe(false);
    });

    it('set() rejects invalid values', () => {
      localStorage.clear();
      Store.reset();
      Store.init();
      
      // Try to set invalid mode
      Store.set('mode', 'invalid');
      expect(Store.get('mode')).toBe('time'); // unchanged
      
      // Try to set invalid duration
      Store.set('duration', 999);
      expect(Store.get('duration')).toBe(30); // unchanged
      
      // Try to set invalid volume
      Store.set('volume', 2.5);
      expect(Store.get('volume')).toBe(0.5); // unchanged
    });
  });
}
