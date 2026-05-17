// Public/js/core/Router.js
// Minimal client-side router. Not a framework.
// Handles two cases: canvas routes (render a view) and PHP routes (delegate to server).
// No work on import — everything explicit via init().
//
// API:
//   Router.init()           -> reads current URL, mounts correct view
//   Router.navigate(path)   -> push to history + mount view
//
// Invariant: Router does NOT know about canvas or Painter — only calls mount functions.

import { mountHomeView } from '../views/HomeView.js';
import { Renderer } from '../renderer/Renderer.js';

// -- Route tables -------------------------------------------------------------

const CANVAS_ROUTES = {
  '/': mountHomeView,
};

const PHP_ROUTES = [
  '/profile',
  '/Profile',
  '/leaderboard',
  '/Leaderboard',
  '/info',
  '/Info',
  '/home/words',
  '/home/typing',
];

function isPhpRoute(path) {
  return PHP_ROUTES.some(route => path === route || path.startsWith(route + '/'));
}

// -- State --------------------------------------------------------------------

let _currentPath = null;

// -- Init ---------------------------------------------------------------------

function init() {
  const path = window.location.pathname;
  
  console.log(`[Router] init - current path: ${path}`);
  
  // Mount initial view
  mount(path);
  
  // Handle browser back/forward
  window.addEventListener('popstate', () => {
    const newPath = window.location.pathname;
    console.log(`[Router] popstate - navigating to: ${newPath}`);
    mount(newPath);
  });
}

// -- Navigate -----------------------------------------------------------------

function navigate(path) {
  // Idempotent - navigating to current path is no-op
  if (path === _currentPath) {
    console.log(`[Router] navigate('${path}') - already on this path, no-op`);
    return;
  }
  
  // PHP routes - full page navigation
  if (isPhpRoute(path)) {
    console.log(`[Router] navigate('${path}') - PHP route, full page navigation`);
    window.location.href = path;
    return;
  }
  
  // Canvas routes - push state and mount
  if (path in CANVAS_ROUTES) {
    console.log(`[Router] navigate('${path}') - canvas route`);
    window.history.pushState({}, '', path);
    mount(path);
    return;
  }
  
  // Unknown route - log warning, stay on current view
  console.warn(`[Router] navigate('${path}') - unknown route, staying on current view`);
}

// -- Mount --------------------------------------------------------------------

function mount(path) {
  // PHP routes - delegate to server
  if (isPhpRoute(path)) {
    // This shouldn't happen in normal flow (navigate() handles it)
    // but could happen on direct page load or popstate
    console.log(`[Router] mount('${path}') - PHP route, reloading page`);
    window.location.href = path;
    return;
  }
  
  // Canvas routes - call mount function
  if (path in CANVAS_ROUTES) {
    _currentPath = path;
    const mountFn = CANVAS_ROUTES[path];
    
    // Get dimensions from Renderer (must be mounted first)
    const { w, h } = Renderer.getLogicalSize();
    
    console.log(`[Router] mount('${path}') - mounting view at ${w}x${h}`);
    mountFn(w, h);
    return;
  }
  
  // Unknown route - log warning, mount home as fallback
  console.warn(`[Router] mount('${path}') - unknown route, mounting home as fallback`);
  _currentPath = '/';
  const { w, h } = Renderer.getLogicalSize();
  CANVAS_ROUTES['/']( w, h);
}

// -- Export -------------------------------------------------------------------

export const Router = { init, navigate };
