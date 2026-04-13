type Theme = 'dark' | 'light';

function resolveTheme(savedTheme: string | null): Theme {
  return savedTheme === 'light' ? 'light' : 'dark';
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);

  const toggle = document.getElementById('theme-toggle') || document.getElementById('theme-btn');
  const icon = toggle?.querySelector('i');

  if (icon) {
    icon.classList.remove('fa-moon', 'fa-sun');
    icon.classList.add(theme === 'light' ? 'fa-sun' : 'fa-moon');
  }

  localStorage.setItem('theme', theme);
}

export function initTheme() {
  const toggle = document.getElementById('theme-toggle') || document.getElementById('theme-btn');
  let currentTheme: Theme = resolveTheme(localStorage.getItem('theme'));

  applyTheme(currentTheme);

  if (!toggle) return;

  toggle.addEventListener('click', () => {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(currentTheme);
  });
}
