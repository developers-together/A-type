type Theme = 'dark' | 'light';

function resolveTheme(candidate: string | null): Theme | null {
  if (candidate === 'light') return 'light';
  if (candidate === 'dark') return 'dark';
  return null;
}

function getServerTheme(): Theme | null {
  const serverTheme = document.querySelector<HTMLMetaElement>('meta[name="server-theme"]')?.content ?? null;
  return resolveTheme(serverTheme);
}

function isAuthenticatedUser(): boolean {
  return document.querySelector<HTMLMetaElement>('meta[name="user-authenticated"]')?.content === '1';
}

function getCsrfToken(): string | null {
  return document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? null;
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);

  const icons = document.querySelectorAll('#theme-toggle i, #theme-btn i');
  icons.forEach((icon) => {
    icon.classList.remove('fa-moon', 'fa-sun');
    icon.classList.add(theme === 'light' ? 'fa-sun' : 'fa-moon');
  });

  localStorage.setItem('theme', theme);
}

async function persistThemePreference(theme: Theme): Promise<void> {
  if (!isAuthenticatedUser()) return;

  const csrfToken = getCsrfToken();
  if (!csrfToken) return;

  try {
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
  } catch (error) {
    console.warn('Unable to persist theme preference', error);
  }
}

export function initTheme() {
  const localTheme = resolveTheme(localStorage.getItem('theme'));
  let currentTheme: Theme = localTheme ?? getServerTheme() ?? 'dark';

  applyTheme(currentTheme);

  const bindToggleListeners = () => {
    const toggles = document.querySelectorAll<HTMLElement>('#theme-toggle, #theme-btn');

    toggles.forEach((toggle) => {
      if (toggle.dataset.themeBound === 'true') return;

      toggle.addEventListener('click', () => {
        currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(currentTheme);
        void persistThemePreference(currentTheme);
      });

      toggle.dataset.themeBound = 'true';
    });
  };

  bindToggleListeners();

  const observer = new MutationObserver(() => {
    bindToggleListeners();
    applyTheme(currentTheme);
  });

  observer.observe(document.body, { childList: true, subtree: true });

  setTimeout(() => observer.disconnect(), 10000);
}
