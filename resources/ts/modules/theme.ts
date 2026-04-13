type Theme = 'dark' | 'light';

function resolveTheme(savedTheme: string | null): Theme {
  return savedTheme === 'light' ? 'light' : 'dark';
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

export function initTheme() {
  let currentTheme: Theme = resolveTheme(localStorage.getItem('theme'));

  applyTheme(currentTheme);

  const bindToggleListeners = () => {
    const toggles = document.querySelectorAll<HTMLElement>('#theme-toggle, #theme-btn');

    toggles.forEach((toggle) => {
      if (toggle.dataset.themeBound === 'true') return;

      toggle.addEventListener('click', () => {
        currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(currentTheme);
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

  // Keep observer short-lived to avoid unnecessary DOM work.
  setTimeout(() => observer.disconnect(), 10000);
}
