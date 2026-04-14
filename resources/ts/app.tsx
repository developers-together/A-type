import '../css/app.css';

import { useEffect, useRef, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { HomePage } from './pages/HomePage';
import { InfoPage } from './pages/InfoPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { LoginPage } from './pages/LoginPage';
import { ProfilePage } from './pages/ProfilePage';
import type { AppPageName, RootPayload, SharedPayload, SharedUser } from './types/app';

function UnknownPage({ page }: { page: string }) {
  return (
    <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-[rgb(var(--surface-strong)/0.7)] bg-[rgb(var(--surface))] p-6">
      <h1 className="text-2xl font-bold">Unknown page: {page}</h1>
      <p className="mt-2 text-sm text-[rgb(var(--text-soft))]">This page identifier is not mapped in the frontend app shell.</p>
    </div>
  );
}

function Router({
  page,
  shared,
  payload,
  onUserUpdate,
}: {
  page: AppPageName;
  shared: SharedPayload;
  payload: RootPayload;
  onUserUpdate: (user: SharedUser | null) => void;
}) {
  const { pushToast } = useToast();
  const flashShownRef = useRef(false);

  useEffect(() => {
    if (flashShownRef.current) return;

    if (shared.flash?.status) {
      pushToast(shared.flash.status, 'success');
    }

    if (shared.flash?.error) {
      pushToast(shared.flash.error, 'error');
    }

    flashShownRef.current = true;
  }, [pushToast, shared.flash?.error, shared.flash?.status]);

  switch (page) {
    case 'home':
      return <HomePage shared={shared} data={payload.data as RootPayload<'home'>['data']} />;
    case 'login':
      return <LoginPage shared={shared} />;
    case 'profile':
      return <ProfilePage shared={shared} data={payload.data as RootPayload<'profile'>['data']} onUserUpdate={onUserUpdate} />;
    case 'info':
      return <InfoPage shared={shared} data={payload.data as RootPayload<'info'>['data']} />;
    case 'leaderboard':
      return <LeaderboardPage shared={shared} data={payload.data as RootPayload<'leaderboard'>['data']} />;
    default:
      return <UnknownPage page={page} />;
  }
}

function App({ page, payload }: { page: AppPageName; payload: RootPayload }) {
  const [shared, setShared] = useState<SharedPayload>(payload.shared);

  function handleUserUpdate(user: SharedUser | null): void {
    setShared((current) => ({
      ...current,
      user,
      auth: user !== null,
    }));
  }

  return (
    <ThemeProvider shared={shared}>
      <ToastProvider>
        <Router page={page} shared={shared} payload={payload} onUserUpdate={handleUserUpdate} />
      </ToastProvider>
    </ThemeProvider>
  );
}

function parseRootData(): { page: AppPageName; payload: RootPayload } | null {
  const element = document.getElementById('app-root');

  if (!element) return null;

  const rawPage = element.dataset.page ?? '';

  if (!rawPage) return null;

  const pageNames: AppPageName[] = ['home', 'login', 'profile', 'info', 'leaderboard'];
  if (!pageNames.includes(rawPage as AppPageName)) return null;

  const rawProps = element.dataset.props ?? '{}';

  const payload = JSON.parse(rawProps) as RootPayload;

  return {
    page: rawPage as AppPageName,
    payload,
  };
}

const rootData = parseRootData();

if (rootData) {
  const rootElement = document.getElementById('app-root');
  if (rootElement) {
    const title = rootElement.dataset.pageTitle;
    if (title) {
      document.title = `A-Type | ${title}`;
    }

    const globalWindow = window as Window & { __atypeRoot?: Root };

    if (!globalWindow.__atypeRoot) {
      globalWindow.__atypeRoot = createRoot(rootElement);
    }

    globalWindow.__atypeRoot.render(<App page={rootData.page} payload={rootData.payload} />);
  }
}
