import { Link, usePage } from '@inertiajs/react';
import { ThemeToggleButton } from './ThemeToggleButton';
import { useThemeController } from '../lib/theme';
import type { SharedPageProps } from '../types/shared';

type AppNavbarProps = {
  currentPath: string;
};

function NavItem({ href, currentPath, label }: { href: string; currentPath: string; label: string }) {
  const isActive = currentPath.startsWith(href);

  return (
    <Link
      href={href}
      className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
        isActive
          ? 'bg-emerald-500 text-slate-950'
          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
      }`}
    >
      {label}
    </Link>
  );
}

export function AppNavbar({ currentPath }: AppNavbarProps) {
  const { auth, csrf_token } = usePage<SharedPageProps>().props;
  const { theme, toggleTheme } = useThemeController(auth.user, csrf_token);

  return (
    <header className="w-full border-b border-slate-800 bg-slate-950/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/home" className="inline-flex items-center gap-2 text-base font-semibold tracking-wide text-slate-100">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 font-bold text-slate-950">
            A
          </span>
          A-Type
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          <NavItem href="/home" currentPath={currentPath} label="Home" />
          <NavItem href="/leaderboard" currentPath={currentPath} label="Leaderboard" />
          <NavItem href="/info" currentPath={currentPath} label="Info" />
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggleButton theme={theme} onToggle={toggleTheme} />

          {auth.user ? (
            <Link href="/profile" className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800">
              {auth.user.username}
            </Link>
          ) : (
            <Link href="/login" className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
