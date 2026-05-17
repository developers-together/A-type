// Public/js/themes/index.js
// Theme registry. Phase 1 delivers one theme (midnight) with mechanism wired.
// The other 22 themes are stubs added later.
// No work on import — everything explicit via init().
//
// API:
//   ThemeRegistry.init()              -> validates all themes, applies current from Store
//   ThemeRegistry.getTheme(name)      -> returns theme object or null
//   ThemeRegistry.setTheme(name)      -> applies theme + emits THEME_CHANGED event
//   ThemeRegistry.getCurrentTheme()   -> returns currently active theme object
//   ThemeRegistry.validateAll()       -> validates all themes, returns array of errors
//
// Invariant: Theme objects are immutable. setTheme() updates Store, not theme objects.

import { Store } from '../core/Store.js';
import { EventBus, EVENTS } from '../core/EventBus.js';

// -- Theme definitions --------------------------------------------------------

const THEMES = {
  midnight: {
    name: 'midnight',
    label: 'Midnight',
    colors: {
      background: '#0a0a0a',
      surface: '#2c2e31',
      text: '#d1d0c5',
      dim: '#646669',
      accent: '#e2b714',
      error: '#ca4754',
      correct: '#d1d0c5',
      cursor: '#e2b714',
    },
  },
  // Phase 10: Add 22 more themes here
};

// Required color keys for validation
const REQUIRED_COLOR_KEYS = [
  'background',
  'surface',
  'text',
  'dim',
  'accent',
  'error',
  'correct',
  'cursor',
];

// -- State --------------------------------------------------------------------

let _currentTheme = null;

// -- Init ---------------------------------------------------------------------

function init() {
  // Validate all themes first
  const errors = validateAll();
  if (errors.length > 0) {
    console.error('[ThemeRegistry] init - validation failed:', errors);
    throw new Error(`[ThemeRegistry] Theme validation failed: ${errors.join(', ')}`);
  }
  
  console.log('[ThemeRegistry] init - all themes valid');
  
  // Apply theme from Store
  const themeName = Store.get('theme');
  
  if (themeName in THEMES) {
    _currentTheme = THEMES[themeName];
    console.log(`[ThemeRegistry] init - applied theme: ${themeName}`);
  } else {
    console.warn(`[ThemeRegistry] init - theme '${themeName}' not found, falling back to 'midnight'`);
    _currentTheme = THEMES.midnight;
    Store.set('theme', 'midnight');
  }
}

// -- Get theme ----------------------------------------------------------------

function getTheme(name) {
  return THEMES[name] ?? null;
}

// -- Set theme ----------------------------------------------------------------

function setTheme(name) {
  if (!(name in THEMES)) {
    console.error(`[ThemeRegistry] setTheme('${name}') - theme not found`);
    return;
  }
  
  const oldTheme = _currentTheme;
  _currentTheme = THEMES[name];
  
  // Update Store (persists + notifies Store subscribers)
  Store.set('theme', name);
  
  // Emit event for immediate UI updates
  EventBus.emit(EVENTS.THEME_CHANGED, { theme: _currentTheme, oldTheme });
  
  console.log(`[ThemeRegistry] setTheme('${name}') - theme applied`);
}

// -- Get current theme --------------------------------------------------------

function getCurrentTheme() {
  return _currentTheme;
}

// -- Validate all themes ------------------------------------------------------

function validateAll() {
  const errors = [];
  
  for (const name in THEMES) {
    const theme = THEMES[name];
    
    // Check theme has name
    if (!theme.name || typeof theme.name !== 'string') {
      errors.push(`Theme '${name}' missing or invalid 'name' field`);
    }
    
    // Check theme has label
    if (!theme.label || typeof theme.label !== 'string') {
      errors.push(`Theme '${name}' missing or invalid 'label' field`);
    }
    
    // Check theme has colors object
    if (!theme.colors || typeof theme.colors !== 'object') {
      errors.push(`Theme '${name}' missing or invalid 'colors' object`);
      continue;
    }
    
    // Check all required color keys exist
    for (const key of REQUIRED_COLOR_KEYS) {
      if (!(key in theme.colors)) {
        errors.push(`Theme '${name}' missing color key: ${key}`);
      } else {
        const color = theme.colors[key];
        // Basic validation - must be string starting with # or rgb
        if (typeof color !== 'string' || (!color.startsWith('#') && !color.startsWith('rgb'))) {
          errors.push(`Theme '${name}' invalid color for '${key}': ${color}`);
        }
      }
    }
  }
  
  return errors;
}

// -- Export -------------------------------------------------------------------

export const ThemeRegistry = {
  init,
  getTheme,
  setTheme,
  getCurrentTheme,
  validateAll,
};
