import { usePage } from '@inertiajs/react';
import { AppLayout } from '../layouts/AppLayout';
import type { SharedPageProps } from '../types/shared';

type InfoPageProps = SharedPageProps & {
  stack: {
    frontend: string;
    backend: string;
    database: string;
    transport: string;
  };
};

export default function InfoPage() {
  const { stack } = usePage<InfoPageProps>().props;

  return (
    <AppLayout title="info" description="About A-Type and the current branch stack.">
      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="mb-2 text-lg font-semibold">About</h2>
          <p className="text-sm leading-6 text-slate-300">
            A-Type helps you train typing speed and accuracy in a minimal environment. This branch keeps the original
            feature set while moving the entire app UI into React + TypeScript pages.
          </p>
        </article>

        <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="mb-2 text-lg font-semibold">How to Use</h2>
          <ol className="list-inside list-decimal space-y-1 text-sm text-slate-300">
            <li>Choose typing mode (time or words).</li>
            <li>Toggle punctuation and numbers as needed.</li>
            <li>Type the highlighted words and press Space after each word.</li>
            <li>Press Tab to reset instantly.</li>
          </ol>
        </article>

        <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 md:col-span-2">
          <h2 className="mb-3 text-lg font-semibold">Current Stack</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-400">Frontend</p>
              <p className="text-sm text-slate-200">{stack.frontend}</p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-400">Backend</p>
              <p className="text-sm text-slate-200">{stack.backend}</p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-400">Database</p>
              <p className="text-sm text-slate-200">{stack.database}</p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-400">Communication</p>
              <p className="text-sm text-slate-200">{stack.transport}</p>
            </div>
          </div>
        </article>
      </section>
    </AppLayout>
  );
}
