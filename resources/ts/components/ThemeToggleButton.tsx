import type { Theme } from '../types/shared';

type ThemeToggleButtonProps = {
  theme: Theme;
  onToggle: () => void;
  className?: string;
};

export function ThemeToggleButton({ theme, onToggle, className = '' }: ThemeToggleButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label="Toggle theme"
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-slate-900/80 text-slate-100 transition hover:bg-slate-800 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100 ${className}`}
    >
      <span className="text-lg leading-none">{theme === 'dark' ? '☾' : '☀'}</span>
    </button>
  );
}
