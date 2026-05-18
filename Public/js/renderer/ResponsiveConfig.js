// Public/js/renderer/ResponsiveConfig.js
// Breakpoint configuration and validation for canvas renderer layout.

const BREAKPOINTS = {
  xs: { minW: 0, fontSize: 14, lineHeight: 1.6, visibleLines: 2, maxContentWidth: null },
  sm: { minW: 480, fontSize: 16, lineHeight: 1.6, visibleLines: 2, maxContentWidth: null },
  md: { minW: 768, fontSize: 18, lineHeight: 1.5, visibleLines: 3, maxContentWidth: 700 },
  lg: { minW: 1024, fontSize: 20, lineHeight: 1.5, visibleLines: 3, maxContentWidth: 900 },
  xl: { minW: 1440, fontSize: 20, lineHeight: 1.5, visibleLines: 3, maxContentWidth: 900 },
  xxl: { minW: 1920, fontSize: 20, lineHeight: 1.4, visibleLines: 4, maxContentWidth: 1100 },
};

const REQUIRED_KEYS = ['minW', 'fontSize', 'lineHeight', 'visibleLines', 'maxContentWidth'];
const ORDERED_NAMES = Object.keys(BREAKPOINTS).sort(
  (a, b) => BREAKPOINTS[a].minW - BREAKPOINTS[b].minW
);

function validateConfig() {
  for (const [name, config] of Object.entries(BREAKPOINTS)) {
    for (const key of REQUIRED_KEYS) {
      if (!(key in config)) {
        throw new Error(`[ResponsiveConfig] Breakpoint '${name}' missing required key '${key}'`);
      }
    }

    if (typeof config.minW !== 'number') {
      throw new Error(`[ResponsiveConfig] Breakpoint '${name}' has invalid minW: ${config.minW}`);
    }
    if (config.fontSize < 10) {
      throw new Error(`[ResponsiveConfig] Breakpoint '${name}' has invalid fontSize: ${config.fontSize}`);
    }
    if (config.lineHeight < 1) {
      throw new Error(`[ResponsiveConfig] Breakpoint '${name}' has invalid lineHeight: ${config.lineHeight}`);
    }
    if (config.visibleLines < 1) {
      throw new Error(`[ResponsiveConfig] Breakpoint '${name}' has invalid visibleLines: ${config.visibleLines}`);
    }
  }
}

function getBreakpoint() {
  const width = window.innerWidth;
  let current = ORDERED_NAMES[0];

  for (const name of ORDERED_NAMES) {
    if (width >= BREAKPOINTS[name].minW) {
      current = name;
    }
  }

  return current;
}

function getConfig() {
  return BREAKPOINTS[getBreakpoint()];
}

export const ResponsiveConfig = {
  validateConfig,
  getBreakpoint,
  getConfig,
};
