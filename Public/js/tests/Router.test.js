// Public/js/tests/Router.test.js
// Tests for Router.js client-side routing

import { describe, it, expect } from './runner.js';

const routerModulePromise = import(`../core/Router.js?v=${Date.now()}`);

async function getRouter() {
  const { Router } = await routerModulePromise;
  return Router;
}

export function routerTests() {
  describe('Router', () => {
    it('isPhpRoute() recognizes php routes and profile subroutes', async () => {
      const Router = await getRouter();
      expect(Router.isPhpRoute('/profile')).toBeTruthy();
      expect(Router.isPhpRoute('/Profile')).toBeTruthy();
      expect(Router.isPhpRoute('/Profile/settings')).toBeTruthy();
      expect(Router.isPhpRoute('/leaderboard')).toBeTruthy();
      expect(Router.isPhpRoute('/info')).toBeTruthy();
      expect(Router.isPhpRoute('/')).toBeFalsy();
    });

    it('navigate() to unknown route logs warning, stays on current view', async () => {
      const Router = await getRouter();
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

    it('navigate() to current path is no-op', async () => {
      const Router = await getRouter();
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
