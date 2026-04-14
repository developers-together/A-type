import type { PropsWithChildren, ReactNode } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { AppNavbar } from '../components/AppNavbar';
import type { SharedPageProps } from '../types/shared';

type AppLayoutProps = PropsWithChildren<{
  title: string;
  description?: string;
  rightSlot?: ReactNode;
}>;

export function AppLayout({ title, description, rightSlot, children }: AppLayoutProps) {
  const page = usePage();
  const props = usePage<SharedPageProps>().props;
  const pathname = new URL(page.url, window.location.origin).pathname;

  return (
    <>
      <Head title={title} />

      <div className="min-h-screen bg-slate-950 text-slate-100">
        <AppNavbar currentPath={pathname} />

        <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6">
          <section className="flex flex-col gap-2 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-2xl shadow-slate-950/40 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-semibold capitalize">{title}</h1>
              {description ? <p className="mt-1 text-sm text-slate-300">{description}</p> : null}
            </div>
            {rightSlot}
          </section>

          {props.flash.status ? (
            <div className="fixed bottom-4 right-4 z-50 w-[min(360px,calc(100vw-2rem))] rounded-lg border border-emerald-400/40 bg-emerald-800/95 px-3 py-2 text-sm text-emerald-50 shadow-2xl">
              {props.flash.status}
            </div>
          ) : null}

          {children}
        </main>
      </div>
    </>
  );
}
