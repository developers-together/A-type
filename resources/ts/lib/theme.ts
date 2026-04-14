import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AuthUser, Theme } from '../types/shared';

const THEME_STORAGE_KEY = 'atype-theme';

function resolveTheme(value: string | null | undefined): Theme | null {
  if (value === 'light' || value === 'dark') {
    return value;
  }

  return null;
}

export function getInitialTheme(user: AuthUser | null): Theme {
  const storedTheme = resolveTheme(typeof window !== 'undefined' ? window.localStorage.getItem(THEME_STORAGE_KEY) : null);
  const userTheme = resolveTheme(user?.theme ?? null);

  return storedTheme ?? userTheme ?? 'dark';
}

export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.dataset.theme = theme;
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
}

export async function persistTheme(theme: Theme, csrfToken: string, user: AuthUser | null): Promise<void> {
  if (!user) {
    return;
  }

  await fetch('/profile/theme', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-CSRF-TOKEN': csrfToken,
    },
    credentials: 'same-origin',
    body: JSON.stringify({ theme }),
  });
}

export function useThemeController(user: AuthUser | null, csrfToken: string) {
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme(user));

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = useCallback(async () => {
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);

    try {
      await persistTheme(nextTheme, csrfToken, user);
    } catch {
      // Silent fallback: local storage still preserves preference for guests.
    }
  }, [csrfToken, theme, user]);

  return useMemo(
    () => ({
      theme,
      toggleTheme,
    }),
    [theme, toggleTheme],
  );
}
