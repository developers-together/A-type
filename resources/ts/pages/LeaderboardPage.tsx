import { AppLayout } from '../components/AppLayout';
import { formatDate } from '../lib/format';
import type { LeaderboardData, SharedPayload } from '../types/app';

type LeaderboardPageProps = {
  shared: SharedPayload;
  data: LeaderboardData;
};

export function LeaderboardPage({ shared, data }: LeaderboardPageProps) {
  return (
    <AppLayout shared={shared} currentPage="leaderboard">
      <section className="grid gap-4">
        <div className="atype-card flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="atype-section-title">Leaderboard</p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight">Top performance</h1>
          </div>

          <div className="flex gap-2">
            <a href="/leaderboard?filter=all_time" className={data.filter === 'all_time' ? 'atype-btn-primary' : 'atype-btn-muted'}>
              All Time
            </a>
            <a href="/leaderboard?filter=daily" className={data.filter === 'daily' ? 'atype-btn-primary' : 'atype-btn-muted'}>
              Daily
            </a>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <LeaderboardTable title="Time 15" rows={data.time} />
          <LeaderboardTable title="Words 10" rows={data.words} />
        </div>
      </section>
    </AppLayout>
  );
}

type Row = LeaderboardData['time'][number];

type LeaderboardTableProps = {
  title: string;
  rows: Row[];
};

function LeaderboardTable({ title, rows }: LeaderboardTableProps) {
  return (
    <div className="atype-card overflow-hidden">
      <p className="atype-section-title">{title}</p>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[rgb(var(--surface-strong)/0.6)] text-[rgb(var(--text-soft))]">
              <th className="px-2 py-2">#</th>
              <th className="px-2 py-2">Name</th>
              <th className="px-2 py-2">WPM</th>
              <th className="px-2 py-2">Acc</th>
              <th className="px-2 py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="px-2 py-4 text-[rgb(var(--text-soft))]" colSpan={5}>
                  No data available
                </td>
              </tr>
            ) : null}
            {rows.map((row, index) => (
              <tr key={`${row.userId}-${row.sessionAt}-${index}`} className="border-b border-[rgb(var(--surface-strong)/0.35)]">
                <td className="px-2 py-2 font-semibold">{index === 0 ? '👑' : index + 1}</td>
                <td className="px-2 py-2">{row.username}</td>
                <td className="px-2 py-2 font-semibold">{row.wpm}</td>
                <td className="px-2 py-2">{Math.round(row.accuracy)}%</td>
                <td className="px-2 py-2 text-[rgb(var(--text-soft))]">{formatDate(row.sessionAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
