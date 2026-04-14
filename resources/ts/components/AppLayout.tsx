import type { SharedPayload } from '../types/app';
import type { ReactNode } from 'react';
import { Navbar } from './Navbar';

type AppLayoutProps = {
  shared: SharedPayload;
  currentPage: string;
  children: ReactNode;
};

export function AppLayout({ shared, currentPage, children }: AppLayoutProps) {
  return (
    <div className="atype-shell">
      <Navbar user={shared.user} currentPage={currentPage} />
      <main className="mx-auto w-full max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}
