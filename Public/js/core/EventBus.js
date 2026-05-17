// Public/js/core/EventBus.js
// Central publish/subscribe event bus.
// No dependencies. Decouples renderer, input, audio, models, and views.
//
// API:
//   EventBus.on(event, callback)   -> subscribe. Returns unsubscribe function.
//   EventBus.off(event, callback)  -> unsubscribe explicitly.
//   EventBus.emit(event, data)     -> notify all subscribers for this event.
//   EventBus.clear(event?)         -> remove all listeners for event, or all if omitted.
//
// Design rules:
//   - Emit is synchronous. Subscribers run immediately in subscription order.
//   - No wildcard events. Every event name is an explicit string.
//   - Subscribers that throw are caught and logged - one bad subscriber
//     never stops others from receiving the event.
//   - Views and nodes must call off() or use the returned unsubscribe fn
//     in their destroy() lifecycle to prevent memory leaks.

const listeners = new Map(); // Map<eventName, Set<callback>>

// -- on -----------------------------------------------------------------------

function on(event, callback) {
  if (typeof callback !== 'function') {
    console.error(`[EventBus] on('${event}') - callback must be a function`);
    return () => {};
  }

  if (!listeners.has(event)) {
    listeners.set(event, new Set());
  }

  listeners.get(event).add(callback);

  // Return unsubscribe function - preferred usage in view lifecycle
  return () => off(event, callback);
}

// -- off ----------------------------------------------------------------------

function off(event, callback) {
  if (!listeners.has(event)) return;
  listeners.get(event).delete(callback);

  // Clean up empty sets to avoid memory accumulation
  if (listeners.get(event).size === 0) {
    listeners.delete(event);
  }
}

// -- emit ---------------------------------------------------------------------

function emit(event, data) {
  if (!listeners.has(event)) return; // no subscribers - fast exit

  // Snapshot the set before iterating - subscribers may unsubscribe mid-emit
  const callbacks = [...listeners.get(event)];

  for (const callback of callbacks) {
    try {
      callback(data);
    } catch (err) {
      // One bad subscriber never kills the others
      console.error(`[EventBus] Error in subscriber for '${event}':`, err);
    }
  }
}

// -- clear --------------------------------------------------------------------

function clear(event) {
  if (event !== undefined) {
    listeners.delete(event);
  } else {
    listeners.clear(); // wipe everything - used in tests only
  }
}

// -- debug helper (dev only) --------------------------------------------------

function listenerCount(event) {
  return listeners.get(event)?.size ?? 0;
}

// -- Canonical event names -----------------------------------------------------
// Define all event names here as constants.
// Import EVENTS wherever you emit or subscribe - never use raw strings.

export const EVENTS = {
  // Session / auth
  SESSION_EXPIRED: 'SESSION_EXPIRED',

  // App lifecycle
  APP_BACKGROUNDED: 'APP_BACKGROUNDED',
  APP_FOREGROUNDED: 'APP_FOREGROUNDED',
  REFRESH_RATE_CHANGED: 'REFRESH_RATE_CHANGED',

  // Renderer
  RENDERER_CONTEXT_LOST: 'RENDERER_CONTEXT_LOST',
  RENDERER_CONTEXT_RESTORED: 'RENDERER_CONTEXT_RESTORED',

  // Input
  INPUT_CHAR: 'INPUT_CHAR',
  INPUT_BACKSPACE: 'INPUT_BACKSPACE',
  INPUT_SPACE: 'INPUT_SPACE',
  INPUT_TAB: 'INPUT_TAB',
  INPUT_ESCAPE: 'INPUT_ESCAPE',
  INPUT_FOCUS: 'INPUT_FOCUS',
  INPUT_BLUR: 'INPUT_BLUR',

  // Pointer / nodes
  NODE_HOVER_IN: 'NODE_HOVER_IN',
  NODE_HOVER_OUT: 'NODE_HOVER_OUT',
  NODE_CLICK: 'NODE_CLICK',

  // Test lifecycle
  TEST_STARTED: 'TEST_STARTED',
  TEST_PAUSED: 'TEST_PAUSED',
  TEST_RESUMED: 'TEST_RESUMED',
  TEST_COMPLETED: 'TEST_COMPLETED',
  TEST_RESET: 'TEST_RESET',
  TEST_WORD_ADVANCED: 'TEST_WORD_ADVANCED',

  // Word system
  WORDS_FETCH_FAILED: 'WORDS_FETCH_FAILED',
  WORDS_REFETCH_STARTED: 'WORDS_REFETCH_STARTED',
  WORDS_REFETCH_COMPLETE: 'WORDS_REFETCH_COMPLETE',

  // Theme
  THEME_CHANGED: 'THEME_CHANGED',

  // Store
  STORE_CHANGED: 'STORE_CHANGED',

  // Router
  ROUTE_CHANGED: 'ROUTE_CHANGED',

  // Sound
  SOUND_CORRECT: 'SOUND_CORRECT',
  SOUND_ERROR: 'SOUND_ERROR',
  SOUND_COMPLETE: 'SOUND_COMPLETE',

  // Settings
  SETTINGS_OPENED: 'SETTINGS_OPENED',
  SETTINGS_CLOSED: 'SETTINGS_CLOSED',
  SLIDER_CHANGE: 'SLIDER_CHANGE',

  // Keyboard shortcuts
  SHORTCUT_FIRED: 'SHORTCUT_FIRED',
};

// -- Export -------------------------------------------------------------------

export const EventBus = { on, off, emit, clear, listenerCount };
