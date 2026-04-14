import { AppLayout } from '../components/AppLayout';
import type { InfoData, SharedPayload } from '../types/app';

type InfoPageProps = {
  shared: SharedPayload;
  data: InfoData;
};

export function InfoPage({ shared, data }: InfoPageProps) {
  return (
    <AppLayout shared={shared} currentPage="info">
      <section className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <div className="atype-card">
          <p className="atype-section-title">Branch status</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight">With-Frameworks</h1>
          <p className="mt-2 text-sm text-[rgb(var(--text-soft))]">
            This branch is the framework-focused edition of A-Type with a Laravel API backend and React frontend.
          </p>

          <div className="mt-4 grid gap-3">
            {data.highlights.map((item, index) => (
              <div key={item} className="atype-card-soft text-sm">
                <p className="font-semibold">0{index + 1}</p>
                <p className="mt-1 text-[rgb(var(--text-soft))]">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="atype-card">
          <p className="atype-section-title">Current stack</p>
          <dl className="mt-4 grid gap-3 text-sm">
            <StackLine label="Backend" value={data.stack.backend} />
            <StackLine label="Frontend" value={data.stack.frontend} />
            <StackLine label="UI" value={data.stack.ui} />
            <StackLine label="Database" value={data.stack.database} />
            <StackLine label="Testing" value={data.stack.tests} />
          </dl>

          <div className="mt-5 rounded-xl border border-[rgb(var(--surface-strong)/0.65)] bg-[rgb(var(--surface-soft))] p-3 text-sm">
            <p className="font-semibold">Repository</p>
            <a className="mt-1 inline-block text-[rgb(var(--brand))] underline" href="https://github.com/developers-together/A-type" target="_blank" rel="noreferrer">
              github.com/developers-together/A-type
            </a>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}

type StackLineProps = {
  label: string;
  value: string;
};

function StackLine({ label, value }: StackLineProps) {
  return (
    <div className="grid gap-1 rounded-lg border border-[rgb(var(--surface-strong)/0.55)] bg-[rgb(var(--surface-soft))] p-3">
      <dt className="text-xs uppercase tracking-[0.15em] text-[rgb(var(--text-soft))]">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}
