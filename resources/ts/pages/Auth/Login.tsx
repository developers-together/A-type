import { FormEvent, useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ThemeToggleButton } from '../../components/ThemeToggleButton';
import { useThemeController } from '../../lib/theme';
import type { SharedPageProps } from '../../types/shared';

type AuthMode = 'login' | 'signup';

export default function LoginPage() {
  const { auth, csrf_token } = usePage<SharedPageProps>().props;
  const [mode, setMode] = useState<AuthMode>('login');
  const { theme, toggleTheme } = useThemeController(auth.user, csrf_token);

  const loginForm = useForm({
    email: '',
    password: '',
  });

  const signupForm = useForm({
    username: '',
    email: '',
    password: '',
    password_confirmation: '',
  });

  const onSubmitLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    loginForm.post('/auth/login', {
      preserveScroll: true,
      onFinish: () => loginForm.reset('password'),
    });
  };

  const onSubmitSignup = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    signupForm.post('/auth/register', {
      preserveScroll: true,
      onFinish: () => signupForm.reset('password', 'password_confirmation'),
    });
  };

  const activeErrors = mode === 'login' ? loginForm.errors : signupForm.errors;

  return (
    <>
      <Head title="Login" />

      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-12 text-slate-100">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.22),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.2),transparent_40%)]" />

        <Link href="/home" className="absolute left-6 top-6 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm font-medium transition hover:bg-slate-800">
          <span aria-hidden>←</span>
          Home
        </Link>

        <ThemeToggleButton theme={theme} onToggle={toggleTheme} className="absolute right-6 top-6" />

        <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/70 backdrop-blur">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-xl font-semibold">{mode === 'login' ? 'Login' : 'Create Account'}</h1>
            <div className="inline-flex rounded-lg border border-slate-700 p-1 text-sm">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`rounded-md px-3 py-1 transition ${mode === 'login' ? 'bg-emerald-500 text-slate-950' : 'text-slate-300 hover:text-white'}`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`rounded-md px-3 py-1 transition ${mode === 'signup' ? 'bg-emerald-500 text-slate-950' : 'text-slate-300 hover:text-white'}`}
              >
                Sign up
              </button>
            </div>
          </div>

          {Object.keys(activeErrors).length > 0 ? (
            <div className="mb-4 rounded-lg border border-rose-500/40 bg-rose-950/70 px-3 py-2 text-sm text-rose-100">
              <ul className="space-y-1">
                {Object.values(activeErrors).map((error) => (
                  <li key={error}>• {error}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {mode === 'login' ? (
            <form onSubmit={onSubmitLogin} className="space-y-3">
              <input
                type="email"
                required
                value={loginForm.data.email}
                onChange={(event) => loginForm.setData('email', event.target.value)}
                placeholder="Email"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none transition focus:border-emerald-400"
              />
              <input
                type="password"
                required
                value={loginForm.data.password}
                onChange={(event) => loginForm.setData('password', event.target.value)}
                placeholder="Password"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none transition focus:border-emerald-400"
              />

              <button
                type="submit"
                disabled={loginForm.processing}
                className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loginForm.processing ? 'Please wait…' : 'Sign in'}
              </button>
            </form>
          ) : (
            <form onSubmit={onSubmitSignup} className="space-y-3">
              <input
                type="text"
                required
                minLength={3}
                maxLength={50}
                value={signupForm.data.username}
                onChange={(event) => signupForm.setData('username', event.target.value)}
                placeholder="Username"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none transition focus:border-emerald-400"
              />
              <input
                type="email"
                required
                value={signupForm.data.email}
                onChange={(event) => signupForm.setData('email', event.target.value)}
                placeholder="Email"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none transition focus:border-emerald-400"
              />
              <input
                type="password"
                required
                minLength={8}
                value={signupForm.data.password}
                onChange={(event) => signupForm.setData('password', event.target.value)}
                placeholder="Password"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none transition focus:border-emerald-400"
              />
              <input
                type="password"
                required
                minLength={8}
                value={signupForm.data.password_confirmation}
                onChange={(event) => signupForm.setData('password_confirmation', event.target.value)}
                placeholder="Confirm password"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none transition focus:border-emerald-400"
              />

              <button
                type="submit"
                disabled={signupForm.processing}
                className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {signupForm.processing ? 'Please wait…' : 'Create account'}
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
