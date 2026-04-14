import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { AppLayout } from '../components/AppLayout';
import { Avatar } from '../components/Avatar';
import { NoteBubble } from '../components/NoteBubble';
import { useToast } from '../context/ToastContext';
import { deleteJson, firstErrorMessage, postFormData, postJson, putJson } from '../lib/http';
import { formatRelative, formatTotalTime } from '../lib/format';
import type { ProfileData, ProfileNote, SharedPayload, SharedUser } from '../types/app';

type ProfilePageProps = {
  shared: SharedPayload;
  data: ProfileData;
  onUserUpdate: (user: SharedUser | null) => void;
};

type ProfileUpdateResponse = {
  status?: string;
  message?: string;
  user?: SharedUser;
  errors?: Record<string, string[]>;
  redirect?: string;
};

export function ProfilePage({ shared, data, onUserUpdate }: ProfilePageProps) {
  const { pushToast } = useToast();

  const [profileForm, setProfileForm] = useState({
    username: shared.user?.username ?? '',
    email: shared.user?.email ?? '',
    password: '',
    password_confirmation: '',
  });

  const [notes, setNotes] = useState<ProfileNote[]>(data.notes);
  const [stats, setStats] = useState(data.stats);
  const [best, setBest] = useState(data.best);

  const [newNote, setNewNote] = useState({ title: '', body: '', isPinned: false });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const quickNote = useMemo(() => {
    const pinned = notes.find((note) => note.isPinned);
    if (pinned) return pinned.body;
    return notes[0]?.body ?? null;
  }, [notes]);

  const currentUser = shared.user;

  useEffect(() => {
    if (!currentUser) return;

    const nextQuickNote = quickNote ? quickNote.slice(0, 96) : null;
    if (currentUser.quickNote === nextQuickNote) return;

    onUserUpdate({
      ...currentUser,
      quickNote: nextQuickNote,
    });
  }, [currentUser, onUserUpdate, quickNote]);

  async function handleProfileUpdate(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (isBusy) return;

    setIsBusy(true);

    const response = await putJson<ProfileUpdateResponse>('/profile', profileForm);

    setIsBusy(false);

    if (!response.ok) {
      pushToast(firstErrorMessage(response.data, 'Unable to update profile.'), 'error');
      return;
    }

    if (response.data.user) {
      onUserUpdate(response.data.user);
    }

    setProfileForm((current) => ({ ...current, password: '', password_confirmation: '' }));
    pushToast(response.data.message || 'Profile updated.', 'success');
  }

  async function uploadAvatar(): Promise<void> {
    if (!avatarFile) {
      pushToast('Select an image first.', 'info');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', avatarFile);

    const response = await postFormData<ProfileUpdateResponse>('/profile/avatar', formData);

    if (!response.ok) {
      pushToast(firstErrorMessage(response.data, 'Could not upload image.'), 'error');
      return;
    }

    if (response.data.user) {
      onUserUpdate(response.data.user);
    }

    setAvatarFile(null);
    pushToast(response.data.message || 'Profile picture updated.', 'success');
  }

  async function removeAvatar(): Promise<void> {
    const response = await deleteJson<ProfileUpdateResponse>('/profile/avatar');

    if (!response.ok) {
      pushToast(firstErrorMessage(response.data, 'Could not remove image.'), 'error');
      return;
    }

    if (response.data.user) {
      onUserUpdate(response.data.user);
    }

    pushToast(response.data.message || 'Profile picture removed.', 'success');
  }

  async function createNote(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    const response = await postJson<{ status?: string; data?: ProfileNote; errors?: Record<string, string[]>; message?: string }>('/profile/notes', {
      title: newNote.title,
      body: newNote.body,
      is_pinned: newNote.isPinned,
    });

    if (!response.ok || !response.data.data) {
      pushToast(firstErrorMessage(response.data, 'Unable to create note.'), 'error');
      return;
    }

    const created = {
      id: response.data.data.id,
      title: response.data.data.title,
      body: response.data.data.body,
      isPinned: response.data.data.isPinned,
      updatedAt: response.data.data.updatedAt ?? new Date().toISOString(),
    };

    setNotes((current) => [created, ...current]);
    setNewNote({ title: '', body: '', isPinned: false });
    pushToast('Quick note added.', 'success');
  }

  async function updateNote(noteId: number, payload: { title: string; body: string; isPinned: boolean }): Promise<void> {
    const response = await putJson<{ status?: string; data?: ProfileNote; errors?: Record<string, string[]>; message?: string }>(`/profile/notes/${noteId}`, {
      title: payload.title,
      body: payload.body,
      is_pinned: payload.isPinned,
    });

    if (!response.ok || !response.data.data) {
      pushToast(firstErrorMessage(response.data, 'Unable to update note.'), 'error');
      return;
    }

    setNotes((current) =>
      current.map((note) =>
        note.id === noteId
          ? {
              ...note,
              title: payload.title,
              body: payload.body,
              isPinned: payload.isPinned,
              updatedAt: new Date().toISOString(),
            }
          : note,
      ),
    );

    pushToast('Note updated.', 'success');
  }

  async function deleteNote(noteId: number): Promise<void> {
    const response = await deleteJson<{ status?: string; message?: string; errors?: Record<string, string[]> }>(`/profile/notes/${noteId}`);

    if (!response.ok) {
      pushToast(firstErrorMessage(response.data, 'Unable to delete note.'), 'error');
      return;
    }

    setNotes((current) => current.filter((note) => note.id !== noteId));
    pushToast('Note deleted.', 'success');
  }

  async function runDangerAction(type: 'logout' | 'delete-account' | 'remove-data'): Promise<void> {
    if (type === 'logout') {
      const response = await postJson<ProfileUpdateResponse>('/auth/logout', {});
      if (!response.ok) {
        pushToast(firstErrorMessage(response.data, 'Logout failed.'), 'error');
        return;
      }
      window.location.href = response.data.redirect || '/home';
      return;
    }

    if (type === 'delete-account') {
      if (!window.confirm('Delete your account permanently?')) return;

      const response = await deleteJson<ProfileUpdateResponse>('/profile');
      if (!response.ok) {
        pushToast(firstErrorMessage(response.data, 'Could not delete account.'), 'error');
        return;
      }
      window.location.href = response.data.redirect || '/home';
      return;
    }

    if (!window.confirm('Remove all typing sessions, notes, and profile personalization data?')) return;

    const response = await deleteJson<ProfileUpdateResponse>('/profile/data');

    if (!response.ok) {
      pushToast(firstErrorMessage(response.data, 'Could not clear profile data.'), 'error');
      return;
    }

    if (response.data.user) {
      onUserUpdate(response.data.user);
    }

    setNotes([]);
    setStats({
      totalTests: 0,
      totalWords: 0,
      totalTime: 0,
      avgWpm: 0,
      avgAcc: 0,
    });
    setBest({
      time: {},
      words: {},
    });

    pushToast(response.data.message || 'All profile data removed.', 'success');
  }

  return (
    <AppLayout shared={shared} currentPage="profile">
      <section className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <aside className="grid content-start gap-4">
          <div className="atype-card relative overflow-visible">
            {quickNote ? <NoteBubble text={quickNote} className="absolute -top-24 left-2" /> : null}
            <div className="mt-8 flex flex-col items-center gap-3 text-center">
              <Avatar username={currentUser?.username ?? 'user'} avatarUrl={currentUser?.avatarUrl} size="xl" />
              <div>
                <p className="text-lg font-bold">{currentUser?.username}</p>
                <p className="text-xs text-[rgb(var(--text-soft))]">Joined {currentUser?.joinedAt ?? '-'}</p>
              </div>

              <label className="atype-btn-muted w-full cursor-pointer">
                Choose picture
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(event) => setAvatarFile(event.target.files?.[0] ?? null)}
                />
              </label>

              <div className="grid w-full grid-cols-2 gap-2">
                <button type="button" className="atype-btn-primary" onClick={uploadAvatar}>
                  Upload
                </button>
                <button type="button" className="atype-btn-muted" onClick={removeAvatar}>
                  Remove
                </button>
              </div>
            </div>
          </div>

          <form onSubmit={handleProfileUpdate} className="atype-card grid gap-3">
            <p className="atype-section-title">Account settings</p>
            <input className="atype-input" type="text" autoComplete="username" value={profileForm.username} onChange={(event) => setProfileForm((current) => ({ ...current, username: event.target.value }))} placeholder="Username" required />
            <input className="atype-input" type="email" autoComplete="email" value={profileForm.email} onChange={(event) => setProfileForm((current) => ({ ...current, email: event.target.value }))} placeholder="Email" required />
            <input className="atype-input" type="password" autoComplete="new-password" value={profileForm.password} onChange={(event) => setProfileForm((current) => ({ ...current, password: event.target.value }))} placeholder="New password (optional)" />
            <input className="atype-input" type="password" autoComplete="new-password" value={profileForm.password_confirmation} onChange={(event) => setProfileForm((current) => ({ ...current, password_confirmation: event.target.value }))} placeholder="Confirm new password" />
            <button type="submit" className="atype-btn-primary" disabled={isBusy}>
              {isBusy ? 'Saving...' : 'Save profile'}
            </button>
          </form>
        </aside>

        <main className="grid gap-4">
          <div className="atype-card">
            <p className="atype-section-title">Lifetime stats</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <StatBlock label="tests" value={String(stats.totalTests)} />
              <StatBlock label="words" value={String(stats.totalWords)} />
              <StatBlock label="time" value={formatTotalTime(stats.totalTime)} />
              <StatBlock label="avg wpm" value={String(stats.avgWpm)} highlight />
              <StatBlock label="accuracy" value={`${stats.avgAcc}%`} />
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <ModeBlock title="time mode" amounts={data.amounts.time} scores={best.time} suffix="s" />
            <ModeBlock title="words mode" amounts={data.amounts.words} scores={best.words} />
          </div>

          <section className="atype-card grid gap-4">
            <div>
              <p className="atype-section-title">Quick note</p>
              <p className="mt-1 text-sm text-[rgb(var(--text-soft))]">Your pinned note appears as a thought bubble on profile and navbar.</p>
            </div>

            <form onSubmit={createNote} className="grid gap-3 rounded-xl border border-[rgb(var(--surface-strong)/0.6)] p-3">
              <input className="atype-input" type="text" placeholder="Note title" value={newNote.title} onChange={(event) => setNewNote((current) => ({ ...current, title: event.target.value }))} required />
              <textarea className="atype-input min-h-[96px]" placeholder="Write your quick note" value={newNote.body} onChange={(event) => setNewNote((current) => ({ ...current, body: event.target.value }))} required />
              <label className="inline-flex items-center gap-2 text-sm text-[rgb(var(--text-soft))]">
                <input type="checkbox" checked={newNote.isPinned} onChange={(event) => setNewNote((current) => ({ ...current, isPinned: event.target.checked }))} />
                pin this note
              </label>
              <button type="submit" className="atype-btn-primary">Add note</button>
            </form>

            <div className="grid gap-3">
              {notes.length === 0 ? <p className="text-sm text-[rgb(var(--text-soft))]">No notes yet.</p> : null}
              {notes.map((note) => (
                <EditableNoteCard key={note.id} note={note} onSave={updateNote} onDelete={deleteNote} />
              ))}
            </div>
          </section>

          <section className="atype-card">
            <p className="atype-section-title text-[rgb(var(--danger))]">Danger zone</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <button type="button" className="atype-btn-muted" onClick={() => runDangerAction('logout')}>
                Logout
              </button>
              <button type="button" className="atype-btn-danger" onClick={() => runDangerAction('delete-account')}>
                Delete account
              </button>
              <button type="button" className="atype-btn-danger" onClick={() => runDangerAction('remove-data')}>
                Remove all data
              </button>
            </div>
          </section>
        </main>
      </section>
    </AppLayout>
  );
}

type StatBlockProps = {
  label: string;
  value: string;
  highlight?: boolean;
};

function StatBlock({ label, value, highlight = false }: StatBlockProps) {
  return (
    <div className="atype-card-soft">
      <p className={`text-2xl font-extrabold ${highlight ? 'text-[rgb(var(--success))]' : ''}`}>{value}</p>
      <p className="text-xs uppercase tracking-[0.18em] text-[rgb(var(--text-soft))]">{label}</p>
    </div>
  );
}

type ModeBlockProps = {
  title: string;
  amounts: number[];
  scores: Record<number, { wpm: number; accuracy: number }>;
  suffix?: string;
};

function ModeBlock({ title, amounts, scores, suffix = '' }: ModeBlockProps) {
  return (
    <div className="atype-card">
      <p className="atype-section-title">{title}</p>
      <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
        {amounts.map((amount) => {
          const score = scores[amount];

          return (
            <div key={amount} className="atype-card-soft text-center">
              <p className="text-xs text-[rgb(var(--text-soft))]">{amount}{suffix}</p>
              <p className="text-lg font-bold text-[rgb(var(--success))]">{score ? Math.round(score.wpm) : '-'}</p>
              <p className="text-xs text-[rgb(var(--text-soft))]">{score ? `${Math.round(score.accuracy)}%` : '-'}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

type EditableNoteCardProps = {
  note: ProfileNote;
  onSave: (id: number, payload: { title: string; body: string; isPinned: boolean }) => void;
  onDelete: (id: number) => void;
};

function EditableNoteCard({ note, onSave, onDelete }: EditableNoteCardProps) {
  const [local, setLocal] = useState({
    title: note.title,
    body: note.body,
    isPinned: note.isPinned,
  });

  return (
    <article className="rounded-xl border border-[rgb(var(--surface-strong)/0.65)] bg-[rgb(var(--surface-soft))] p-3">
      <div className="grid gap-2">
        <input className="atype-input" type="text" value={local.title} onChange={(event) => setLocal((current) => ({ ...current, title: event.target.value }))} />
        <textarea className="atype-input min-h-[90px]" value={local.body} onChange={(event) => setLocal((current) => ({ ...current, body: event.target.value }))} />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="inline-flex items-center gap-2 text-xs text-[rgb(var(--text-soft))]">
            <input type="checkbox" checked={local.isPinned} onChange={(event) => setLocal((current) => ({ ...current, isPinned: event.target.checked }))} />
            pinned
          </label>
          <span className="text-xs text-[rgb(var(--text-soft))]">updated {formatRelative(note.updatedAt)}</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button type="button" className="atype-btn-primary" onClick={() => onSave(note.id, local)}>
            Save
          </button>
          <button type="button" className="atype-btn-danger" onClick={() => onDelete(note.id)}>
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}
