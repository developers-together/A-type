import type { SharedUser } from '../types/app';
import { Avatar } from './Avatar';
import { NoteBubble } from './NoteBubble';
import { useTheme } from '../context/ThemeContext';

type NavbarProps = {
  user: SharedUser | null;
  currentPage: string;
};

function navLinkClass(active: boolean): string {
  return `rounded-lg px-3 py-2 text-sm font-semibold transition ${
    active
      ? 'bg-[rgb(var(--brand)/0.12)] text-[rgb(var(--text))]'
      : 'text-[rgb(var(--text-soft))] hover:bg-[rgb(var(--surface-soft))] hover:text-[rgb(var(--text))]'
  }`;
}

export function Navbar({ user, currentPage }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();

  const quickNote = user?.quickNote?.trim() || null;

  return (
    <nav className="w-full border-b border-[rgb(var(--surface-strong)/0.7)] bg-[rgb(var(--surface)/0.95)]">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 md:flex-nowrap">
        <a href="/home" className="flex items-center gap-3">
          <img src="/assets/Logo/logo.svg" alt="A-Type logo" className="h-10 w-10 rounded-md border border-[rgb(var(--surface-strong)/0.7)] bg-[rgb(var(--surface-soft))] p-1" />
          <div>
            <p className="font-['Space_Grotesk'] text-lg font-bold tracking-tight">ATYPE</p>
            <p className="text-xs text-[rgb(var(--text-soft))]">typing framework edition</p>
          </div>
        </a>

        <div className="flex items-center gap-1">
          <a href="/home" className={navLinkClass(currentPage === 'home')}>Home</a>
          <a href="/leaderboard" className={navLinkClass(currentPage === 'leaderboard')}>Leaderboard</a>
          <a href="/info" className={navLinkClass(currentPage === 'info')}>Info</a>
        </div>

        <div className="flex items-center gap-2">
          <button type="button" onClick={toggleTheme} className="atype-btn-muted text-xs">
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>

          <div className="relative pl-1">
            {quickNote ? <NoteBubble text={quickNote} compact className="absolute right-0 bottom-12 z-20" /> : null}
            <a href={user ? '/profile' : '/login'} className="inline-flex">
              <Avatar username={user?.username ?? 'guest'} avatarUrl={user?.avatarUrl} size="md" />
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
