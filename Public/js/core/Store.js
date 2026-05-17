// Public/js/core/Store.js
// localStorage-backed reactive store. Thin wrapper — not a framework.
// No work on import — everything explicit via init().
//
// API:
//   Store.init()                    -> reads localStorage, validates, sets defaults
//   Store.get(key)                  -> returns current value
//   Store.set(key, value)           -> persists + notifies subscribers
//   Store.subscribe(key, callback)  -> callback(newValue, oldValue) on change
//   Store.reset()                   -> restore all keys to defaults (for testing)
//
// Invariant: Store is the single source of truth for all persisted app state.
// No module-level mutable globals outside Store.

const STORAGE_KEY = 'atype_settings';

const DEFAULTS = {
  theme: 'midnight',
  mode: 'time',           // 'time' | 'words'
  duration: 30,           // 15 | 30 | 60 | 120
  wordCount: 25,          // 10 | 25 | 50 | 100
  punctuation: false,
  numbers: false,
  volume: 0.5,
};

const VALIDATORS = {
  theme: (v) => typeof v === 'string',
  mode: (v) => v === 'time' || v === 'words',
  duration: (v) => [15, 30, 60, 120].includes(v),
  wordCount: (v) => [10, 25, 50, 100].includes(v),
  punctuation: (v) => typeof v === 'boolean',
  numbers: (v) => typeof v === 'boolean',
  volume: (v) => typeof v === 'number' && v >= 0 && v <= 1,
};

// -- State --------------------------------------------------------------------

let _state = { ...DEFAULTS };
let _subscribers = new Map(); // key -> Set<callback>

// -- Init ---------------------------------------------------------------------

function init() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      
      // Validate and merge each key
      for (const key in DEFAULTS) {
        if (key in parsed) {
          const validator = VALIDATORS[key];
          if (validator && validator(parsed[key])) {
            _state[key] = parsed[key];
          } else {
            console.warn(`[Store] Invalid persisted value for '${key}': ${JSON.stringify(parsed[key])}, using default`);
            _state[key] = DEFAULTS[key];
          }
        }
      }
      
      console.log('[Store] init - restored from localStorage:', _state);
    } else {
      console.log('[Store] init - no persisted state, using defaults');
    }
  } catch (err) {
    console.error('[Store] init - failed to parse localStorage, using defaults:', err);
    _state = { ...DEFAULTS };
  }
  
  // Persist initial state
  persist();
}

// -- Get ----------------------------------------------------------------------

function get(key) {
  if (!(key in _state)) {
    console.error(`[Store] get('${key}') - unknown key`);
    return undefined;
  }
  return _state[key];
}

// -- Set ----------------------------------------------------------------------

function set(key, value) {
  if (!(key in _state)) {
    console.error(`[Store] set('${key}') - unknown key`);
    return;
  }
  
  // Validate
  const validator = VALIDATORS[key];
  if (!validator || !validator(value)) {
    console.error(`[Store] set('${key}', ${JSON.stringify(value)}) - invalid value, rejected`);
    return;
  }
  
  const oldValue = _state[key];
  
  // Skip if unchanged
  if (Object.is(oldValue, value)) {
    return;
  }
  
  // Update state
  _state[key] = value;
  
  // Persist
  persist();
  
  // Notify subscribers
  notify(key, value, oldValue);
}

// -- Subscribe ----------------------------------------------------------------

function subscribe(key, callback) {
  if (!(key in _state)) {
    console.error(`[Store] subscribe('${key}') - unknown key`);
    return () => {};
  }
  
  if (typeof callback !== 'function') {
    console.error(`[Store] subscribe('${key}') - callback must be a function`);
    return () => {};
  }
  
  if (!_subscribers.has(key)) {
    _subscribers.set(key, new Set());
  }
  
  _subscribers.get(key).add(callback);
  
  // Return unsubscribe function
  return () => {
    if (_subscribers.has(key)) {
      _subscribers.get(key).delete(callback);
      if (_subscribers.get(key).size === 0) {
        _subscribers.delete(key);
      }
    }
  };
}

// -- Reset --------------------------------------------------------------------

function reset() {
  const oldState = { ..._state };
  _state = { ...DEFAULTS };
  persist();
  
  // Notify all subscribers of changes
  for (const key in DEFAULTS) {
    if (!Object.is(oldState[key], DEFAULTS[key])) {
      notify(key, DEFAULTS[key], oldState[key]);
    }
  }
  
  console.log('[Store] reset - all keys restored to defaults');
}

// -- Helpers ------------------------------------------------------------------

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(_state));
  } catch (err) {
    console.error('[Store] persist - failed to write to localStorage:', err);
  }
}

function notify(key, newValue, oldValue) {
  if (!_subscribers.has(key)) return;
  
  const callbacks = [..._subscribers.get(key)];
  for (const callback of callbacks) {
    try {
      callback(newValue, oldValue);
    } catch (err) {
      console.error(`[Store] Error in subscriber for '${key}':`, err);
    }
  }
}

// -- Export -------------------------------------------------------------------

export const Store = { init, get, set, subscribe, reset };
