import { FormEvent, useMemo, useState } from 'react';
import { router, useForm, usePage } from '@inertiajs/react';
import { AppLayout } from '../layouts/AppLayout';
import { fetchJson, postJson } from '../lib/http';
import type { SharedPageProps } from '../types/shared';

type ProfileStatsItem = {
  mode: 'time' | 'words';
  amount: number;
  wpm: number;
  accuracy: number;
  session_at: string | null;
};

type ProfileSummary = {
  avg_acc: number;
  avg_wpm: number;
  total_words: number;
  total_time: number;
  total_tests: number;
};

type ProfileNote = {
  id: number;
  title: string;
  body: string;
  is_pinned: boolean;
  updated_at: string | null;
};

type ProfilePageProps = SharedPageProps & {
  profile: {
    id: number;
    username: string;
    email: string;
    created_at: string | null;
  };
  stats: ProfileStatsItem[];
  summary: ProfileSummary;
  notes: ProfileNote[];
};

function formatDuration(totalSeconds: number): string {
  if (!totalSeconds) {
    return '-';
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}

function statValue(value: number): string {
  if (!value) {
    return '-';
  }

  return String(value);
}

export default function ProfilePage() {
  const { profile, summary, stats, notes: initialNotes } = usePage<ProfilePageProps>().props;

  const [notes, setNotes] = useState<ProfileNote[]>(initialNotes);
  const [noteForm, setNoteForm] = useState({ title: '', body: '', is_pinned: false });
  const [busyNoteId, setBusyNoteId] = useState<number | null>(null);
  const [localStatus, setLocalStatus] = useState<string>('');

  const profileForm = useForm({
    username: profile.username,
    email: profile.email,
    password: '',
    password_confirmation: '',
  });

  const accountDeleteForm = useForm({
    current_password: '',
  });

  const timeStats = useMemo(() => {
    const map = new Map<number, ProfileStatsItem>();
    for (const item of stats) {
      if (item.mode === 'time') {
        map.set(item.amount, item);
      }
    }
    return map;
  }, [stats]);

  const wordsStats = useMemo(() => {
    const map = new Map<number, ProfileStatsItem>();
    for (const item of stats) {
      if (item.mode === 'words') {
        map.set(item.amount, item);
      }
    }
    return map;
  }, [stats]);

  const createNote = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!noteForm.title.trim() || !noteForm.body.trim()) {
      return;
    }

    try {
      const response = await postJson<{ status: string; data: ProfileNote }>('/profile/notes', {
        title: noteForm.title,
        body: noteForm.body,
        is_pinned: noteForm.is_pinned,
      });

      setNotes((previous) => [response.data, ...previous].sort((a, b) => Number(b.is_pinned) - Number(a.is_pinned)));
      setNoteForm({ title: '', body: '', is_pinned: false });
      setLocalStatus('Profile note created.');
    } catch {
      setLocalStatus('Unable to create note. Please check your input.');
    }
  };

  const updateNote = async (note: ProfileNote) => {
    setBusyNoteId(note.id);

    try {
      const response = await fetchJson<{ status: string; data: ProfileNote }>(`/profile/notes/${note.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: note.title,
          body: note.body,
          is_pinned: note.is_pinned,
        }),
      });

      setNotes((previous) =>
        previous
          .map((entry) => (entry.id === note.id ? response.data : entry))
          .sort((a, b) => Number(b.is_pinned) - Number(a.is_pinned)),
      );
      setLocalStatus('Profile note updated.');
    } catch {
      setLocalStatus('Unable to update note.');
    } finally {
      setBusyNoteId(null);
    }
  };

  const deleteNote = async (noteId: number) => {
    setBusyNoteId(noteId);

    try {
      await fetchJson<{ status: string }>(`/profile/notes/${noteId}`, {
        method: 'DELETE',
      });
      setNotes((previous) => previous.filter((entry) => entry.id !== noteId));
      setLocalStatus('Profile note deleted.');
    } catch {
      setLocalStatus('Unable to delete note.');
    } finally {
      setBusyNoteId(null);
    }
  };

  return (
    <AppLayout title="profile" description="Manage your account settings, notes, and typing stats.">
      <section className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <div className="relative mx-auto mb-3 flex h-24 w-24 items-center justify-center rounded-full border border-slate-700 bg-slate-950 text-4xl text-slate-300">
              {profile.username[0]?.toUpperCase() ?? 'U'}
            </div>
            <h2 className="text-center text-lg font-semibold">{profile.username}</h2>
            <p className="text-center text-sm text-slate-400">
              joined {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : '-'}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Account Settings</h3>
            <form
              className="space-y-3"
              onSubmit={(event) => {
                event.preventDefault();
                profileForm.put('/profile', {
                  preserveScroll: true,
                  onSuccess: () => profileForm.reset('password', 'password_confirmation'),
                });
              }}
            >
              <input
                value={profileForm.data.username}
                onChange={(event) => profileForm.setData('username', event.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none transition focus:border-emerald-400"
                placeholder="Username"
                required
              />
              <input
                value={profileForm.data.email}
                onChange={(event) => profileForm.setData('email', event.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none transition focus:border-emerald-400"
                placeholder="Email"
                type="email"
                required
              />
              <input
                value={profileForm.data.password}
                onChange={(event) => profileForm.setData('password', event.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none transition focus:border-emerald-400"
                placeholder="New password (optional)"
                type="password"
              />
              <input
                value={profileForm.data.password_confirmation}
                onChange={(event) => profileForm.setData('password_confirmation', event.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none transition focus:border-emerald-400"
                placeholder="Confirm new password"
                type="password"
              />

              <button
                type="submit"
                className="w-full rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
                disabled={profileForm.processing}
              >
                Update Profile
              </button>
            </form>
          </div>
        </aside>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-center">
              <p className="text-xs uppercase tracking-wide text-slate-400">tests</p>
              <p className="text-xl font-semibold">{statValue(summary.total_tests)}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-center">
              <p className="text-xs uppercase tracking-wide text-slate-400">words</p>
              <p className="text-xl font-semibold">{summary.total_words ? summary.total_words.toLocaleString() : '-'}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-center">
              <p className="text-xs uppercase tracking-wide text-slate-400">time</p>
              <p className="text-xl font-semibold">{formatDuration(summary.total_time)}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-center">
              <p className="text-xs uppercase tracking-wide text-slate-400">avg wpm</p>
              <p className="text-xl font-semibold text-emerald-400">{summary.avg_wpm ? Math.round(summary.avg_wpm) : '-'}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-center">
              <p className="text-xs uppercase tracking-wide text-slate-400">accuracy</p>
              <p className="text-xl font-semibold">{summary.avg_acc ? `${Math.round(summary.avg_acc)}%` : '-'}</p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">time mode</h3>
              <div className="grid grid-cols-2 gap-2">
                {[15, 30, 60, 120].map((option) => {
                  const item = timeStats.get(option);
                  return (
                    <div key={option} className="rounded-lg border border-slate-800 bg-slate-950 p-3 text-sm">
                      <p className="text-slate-400">{option}s</p>
                      <p className="font-semibold text-emerald-400">{item ? Math.round(item.wpm) : '-'}</p>
                      <p className="text-slate-400">{item ? `${Math.round(item.accuracy)}%` : '-'}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">words mode</h3>
              <div className="grid grid-cols-2 gap-2">
                {[10, 25, 50, 100].map((option) => {
                  const item = wordsStats.get(option);
                  return (
                    <div key={option} className="rounded-lg border border-slate-800 bg-slate-950 p-3 text-sm">
                      <p className="text-slate-400">{option}</p>
                      <p className="font-semibold text-emerald-400">{item ? Math.round(item.wpm) : '-'}</p>
                      <p className="text-slate-400">{item ? `${Math.round(item.accuracy)}%` : '-'}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">quick notes</h3>
            <p className="mb-4 text-sm text-slate-400">Create, edit, and delete notes from your profile.</p>

            <form onSubmit={createNote} className="mb-4 grid gap-2">
              <input
                value={noteForm.title}
                onChange={(event) => setNoteForm((previous) => ({ ...previous, title: event.target.value }))}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none transition focus:border-emerald-400"
                placeholder="Note title"
                maxLength={120}
                required
              />
              <textarea
                value={noteForm.body}
                onChange={(event) => setNoteForm((previous) => ({ ...previous, body: event.target.value }))}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none transition focus:border-emerald-400"
                placeholder="Write a note"
                maxLength={2000}
                rows={3}
                required
              />
              <label className="inline-flex items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={noteForm.is_pinned}
                  onChange={(event) => setNoteForm((previous) => ({ ...previous, is_pinned: event.target.checked }))}
                  className="h-4 w-4 rounded border-slate-600 bg-slate-950 text-emerald-500"
                />
                pin this note
              </label>
              <button type="submit" className="justify-self-start rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400">
                Add Note
              </button>
            </form>

            <div className="grid gap-3">
              {notes.length === 0 ? (
                <p className="text-sm text-slate-400">No notes yet. Add your first one.</p>
              ) : (
                notes.map((note) => (
                  <article key={note.id} className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                    <input
                      value={note.title}
                      onChange={(event) => {
                        const value = event.target.value;
                        setNotes((previous) =>
                          previous.map((entry) => (entry.id === note.id ? { ...entry, title: value } : entry)),
                        );
                      }}
                      className="mb-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none transition focus:border-emerald-400"
                    />
                    <textarea
                      value={note.body}
                      onChange={(event) => {
                        const value = event.target.value;
                        setNotes((previous) =>
                          previous.map((entry) => (entry.id === note.id ? { ...entry, body: value } : entry)),
                        );
                      }}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none transition focus:border-emerald-400"
                      rows={3}
                    />

                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                      <label className="inline-flex items-center gap-2 text-sm text-slate-300">
                        <input
                          type="checkbox"
                          checked={note.is_pinned}
                          onChange={(event) => {
                            const checked = event.target.checked;
                            setNotes((previous) =>
                              previous.map((entry) => (entry.id === note.id ? { ...entry, is_pinned: checked } : entry)),
                            );
                          }}
                        />
                        pinned
                      </label>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            void updateNote(note);
                          }}
                          disabled={busyNoteId === note.id}
                          className="rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            void deleteNote(note.id);
                          }}
                          disabled={busyNoteId === note.id}
                          className="rounded-lg border border-rose-500/40 bg-rose-950/60 px-3 py-1.5 text-sm font-semibold text-rose-100 transition hover:bg-rose-900 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-rose-500/35 bg-rose-950/20 p-4">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-rose-200">danger zone</h3>
            <div className="flex flex-wrap items-start gap-2">
              <button
                type="button"
                onClick={() => router.post('/auth/logout')}
                className="rounded-lg border border-rose-500/40 bg-rose-900/50 px-3 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-900"
              >
                log out
              </button>

              <form
                className="flex flex-wrap items-center gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  accountDeleteForm.delete('/profile');
                }}
              >
                <input
                  type="password"
                  value={accountDeleteForm.data.current_password}
                  onChange={(event) => accountDeleteForm.setData('current_password', event.target.value)}
                  placeholder="Current password"
                  required
                  className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none transition focus:border-rose-300"
                />
                <button
                  type="submit"
                  className="rounded-lg border border-rose-500/40 bg-rose-900/70 px-3 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-800"
                >
                  delete account
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {localStatus ? (
        <div className="fixed bottom-4 right-4 z-50 w-[min(360px,calc(100vw-2rem))] rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 shadow-2xl">
          {localStatus}
        </div>
      ) : null}
    </AppLayout>
  );
}
