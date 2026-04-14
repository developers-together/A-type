import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { putJson } from '../lib/http';
import type { SharedPayload, ThemeMode } from '../types/app';

type ThemeContextValue = {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'atype.theme';

function resolveTheme(shared: SharedPayload): ThemeMode {
  const localTheme = localStorage.getItem(STORAGE_KEY);

  if (localTheme === 'light' || localTheme === 'dark') {
    return localTheme;
  }

  if (shared.theme === 'light' || shared.theme === 'dark') {
    return shared.theme;
  }

  return 'dark';
}

type ThemeProviderProps = {
  children: ReactNode;
  shared: SharedPayload;
};

export function ThemeProvider({ children, shared }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeMode>(() => resolveTheme(shared));

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  async function persistTheme(nextTheme: ThemeMode): Promise<void> {
    if (!shared.auth) return;

    await putJson<{ status: string }>('/profile/theme', { theme: nextTheme });
  }

  function setTheme(nextTheme: ThemeMode): void {
    setThemeState(nextTheme);
    void persistTheme(nextTheme);
  }

  function toggleTheme(): void {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  }

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      toggleTheme,
      setTheme,
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }

  return context;
}
