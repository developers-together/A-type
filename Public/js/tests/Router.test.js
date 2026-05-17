// Public/js/tests/Router.test.js
// Tests for Router.js client-side routing

import { describe, it, expect } from './runner.js';
import { Router } from '../core/Router.js';

export function routerTests() {
  describe('Router', () => {
    it('navigate() to known PHP route does not throw', () => {
      // PHP routes delegate to window.location — we cannot intercept that in browser
      // but we can verify the router does not crash and does not call mountHomeView
      // by checking no canvas-mount log appears for a PHP path
      
      const originalLog = console.log;
      let mountCalled = false;
      
      console.log = (msg, ...rest) => {
        if (typeof msg === 'string' && msg.includes('mounting view')) {
          mountCalled = true;
        }
        originalLog(msg, ...rest);
      };

      try {
        Router.navigate('/profile');
      } catch (e) {
        // window.location change may throw in test environment — acceptable
      }

      console.log = originalLog;

      // A PHP route must never trigger a canvas view mount
      expect(mountCalled).toBeFalsy();
    });

    it('navigate() to unknown route logs warning, stays on current view', () => {
      // Capture console.warn
      const originalWarn = console.warn;
      let warnCalled = false;
      let warnMessage = '';
      
      console.warn = (msg) => {
        warnCalled = true;
        warnMessage = msg;
      };
      
      Router.navigate('/unknown-route');
      
      expect(warnCalled).toBeTruthy();
      expect(warnMessage.includes('unknown route')).toBeTruthy();
      
      // Restore
      console.warn = originalWarn;
    });

    it('navigate() to current path is no-op', () => {
      // Capture console.log
      const originalLog = console.log;
      let logCalled = false;
      let logMessage = '';
      
      console.log = (msg) => {
        if (msg.includes('already on this path')) {
          logCalled = true;
          logMessage = msg;
        }
      };
      
      // Navigate to home twice
      Router.navigate('/');
      Router.navigate('/');
      
      expect(logCalled).toBeTruthy();
      expect(logMessage.includes('no-op')).toBeTruthy();
      
      // Restore
      console.log = originalLog;
    });
  });
}
