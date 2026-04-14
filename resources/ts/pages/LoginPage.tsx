import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { firstErrorMessage, postJson } from '../lib/http';
import type { SharedPayload } from '../types/app';
import { AppLayout } from '../components/AppLayout';
import { useToast } from '../context/ToastContext';

type LoginPageProps = {
  shared: SharedPayload;
};

type AuthResponse = {
  status?: string;
  redirect?: string;
  message?: string;
  errors?: Record<string, string[]>;
};

export function LoginPage({ shared }: LoginPageProps) {
  const { pushToast } = useToast();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [busy, setBusy] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupPasswordConfirm, setSignupPasswordConfirm] = useState('');

  const loginReady = useMemo(() => loginEmail.trim() && loginPassword.trim(), [loginEmail, loginPassword]);
  const signupReady = useMemo(
    () => signupUsername.trim() && signupEmail.trim() && signupPassword.trim() && signupPasswordConfirm.trim(),
    [signupUsername, signupEmail, signupPassword, signupPasswordConfirm],
  );

  async function submitLogin(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!loginReady || busy) return;

    setBusy(true);

    const response = await postJson<AuthResponse>('/auth/login', {
      email: loginEmail,
      password: loginPassword,
    });

    setBusy(false);

    if (!response.ok) {
      pushToast(firstErrorMessage(response.data, 'Login failed.'), 'error');
      return;
    }

    window.location.href = response.data.redirect || '/profile';
  }

  async function submitSignup(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!signupReady || busy) return;

    setBusy(true);

    const response = await postJson<AuthResponse>('/auth/register', {
      username: signupUsername,
      email: signupEmail,
      password: signupPassword,
      password_confirmation: signupPasswordConfirm,
    });

    setBusy(false);

    if (!response.ok) {
      pushToast(firstErrorMessage(response.data, 'Signup failed.'), 'error');
      return;
    }

    window.location.href = response.data.redirect || '/profile';
  }

  return (
    <AppLayout shared={shared} currentPage="login">
      <section className="mx-auto grid w-full max-w-4xl gap-5 lg:grid-cols-[1.1fr_1fr]">
        <div className="atype-card flex flex-col justify-between gap-5">
          <div>
            <p className="atype-section-title">Branch Stack</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight">React + TypeScript + Tailwind</h1>
            <p className="mt-2 text-sm text-[rgb(var(--text-soft))]">
              This branch runs on Laravel backend APIs with a modern React frontend and a theme-token-based UI system.
            </p>
          </div>
          <div className="grid gap-2 text-sm text-[rgb(var(--text-soft))]">
            <p>1. Full CRUD with validation</p>
            <p>2. MySQL-ready runtime configuration</p>
            <p>3. Profile notes, avatars, and typed-session history</p>
          </div>
        </div>

        <div className="atype-card">
          <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl bg-[rgb(var(--surface-soft))] p-1">
            <button type="button" onClick={() => setMode('login')} className={`atype-btn ${mode === 'login' ? 'bg-[rgb(var(--surface))] text-[rgb(var(--text))]' : 'text-[rgb(var(--text-soft))]'}`}>
              Login
            </button>
            <button type="button" onClick={() => setMode('signup')} className={`atype-btn ${mode === 'signup' ? 'bg-[rgb(var(--surface))] text-[rgb(var(--text))]' : 'text-[rgb(var(--text-soft))]'}`}>
              Sign Up
            </button>
          </div>

          {mode === 'login' ? (
            <form onSubmit={submitLogin} className="grid gap-3">
              <input className="atype-input" type="email" placeholder="Email" autoComplete="email" value={loginEmail} onChange={(event) => setLoginEmail(event.target.value)} required />
              <input className="atype-input" type="password" placeholder="Password" autoComplete="current-password" value={loginPassword} onChange={(event) => setLoginPassword(event.target.value)} required />
              <button type="submit" className="atype-btn-primary" disabled={!loginReady || busy}>
                {busy ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={submitSignup} className="grid gap-3">
              <input className="atype-input" type="text" placeholder="Username" autoComplete="username" value={signupUsername} onChange={(event) => setSignupUsername(event.target.value)} required />
              <input className="atype-input" type="email" placeholder="Email" autoComplete="email" value={signupEmail} onChange={(event) => setSignupEmail(event.target.value)} required />
              <input className="atype-input" type="password" placeholder="Password" autoComplete="new-password" value={signupPassword} onChange={(event) => setSignupPassword(event.target.value)} required />
              <input className="atype-input" type="password" placeholder="Confirm password" autoComplete="new-password" value={signupPasswordConfirm} onChange={(event) => setSignupPasswordConfirm(event.target.value)} required />
              <button type="submit" className="atype-btn-primary" disabled={!signupReady || busy}>
                {busy ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          )}
        </div>
      </section>
    </AppLayout>
  );
}
