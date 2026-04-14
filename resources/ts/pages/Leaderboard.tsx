import { Link, usePage } from '@inertiajs/react';
import { AppLayout } from '../layouts/AppLayout';
import type { SharedPageProps } from '../types/shared';

type LeaderboardEntry = {
  user_id: number;
  username: string;
  wpm: number;
  accuracy: number;
  session_at: string;
};

type LeaderboardPageProps = SharedPageProps & {
  time: LeaderboardEntry[];
  words: LeaderboardEntry[];
  current_filter: 'all_time' | 'daily';
};

function LeaderboardTable({ title, rows }: { title: string; rows: LeaderboardEntry[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/70">
      <table className="w-full text-left text-sm">
        <caption className="border-b border-slate-800 bg-slate-950 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
          {title}
        </caption>
        <thead className="bg-slate-950/70 text-xs uppercase tracking-wide text-slate-400">
          <tr>
            <th className="px-3 py-2">#</th>
            <th className="px-3 py-2">Name</th>
            <th className="px-3 py-2">WPM</th>
            <th className="px-3 py-2">Accuracy</th>
            <th className="px-3 py-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-3 py-4 text-center text-slate-400">
                No data available
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr key={`${row.user_id}-${index}`} className="border-t border-slate-800/70">
                <td className="px-3 py-2 text-slate-300">{index === 0 ? '♛' : index + 1}</td>
                <td className="px-3 py-2 font-medium text-slate-100">{row.username}</td>
                <td className="px-3 py-2 text-emerald-400">{row.wpm}</td>
                <td className="px-3 py-2">{Math.round(row.accuracy)}%</td>
                <td className="px-3 py-2 text-slate-400">{new Date(row.session_at).toLocaleDateString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function LeaderboardPage() {
  const { time, words, current_filter } = usePage<LeaderboardPageProps>().props;

  return (
    <AppLayout title="leaderboard" description="Top typing scores for time and words modes.">
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Link
            href="/leaderboard?filter=all_time"
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              current_filter === 'all_time'
                ? 'bg-emerald-500 text-slate-950'
                : 'border border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            All Time
          </Link>
          <Link
            href="/leaderboard?filter=daily"
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              current_filter === 'daily'
                ? 'bg-emerald-500 text-slate-950'
                : 'border border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Daily
          </Link>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <LeaderboardTable title="Time 15" rows={time} />
          <LeaderboardTable title="Words 10" rows={words} />
        </div>
      </section>
    </AppLayout>
  );
}
