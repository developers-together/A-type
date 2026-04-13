import { FormEvent, useMemo, useState } from 'react';

type Mode = 'login' | 'signup';

type ApiSuccess = {
  status?: string;
  redirect?: string;
};

type ApiError = {
  message?: string;
  errors?: Record<string, string[]>;
};

const homePath = '/home';
const defaultProfilePath = '/profile';

function getCsrfToken(): string {
  return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
}

async function postJson<TBody extends Record<string, unknown>>(url: string, body: TBody): Promise<ApiSuccess> {
  const response = await fetch(url, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'X-CSRF-TOKEN': getCsrfToken(),
    },
    body: JSON.stringify(body),
  });

  const data = (await response.json().catch(() => ({}))) as ApiSuccess & ApiError;

  if (!response.ok) {
    const firstValidationError = data.errors
      ? Object.values(data.errors).flat()[0]
      : null;

    throw new Error(firstValidationError || data.message || 'Request failed.');
  }

  return data;
}

export function AuthApp() {
  const [mode, setMode] = useState<Mode>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [username, setUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupPasswordConfirmation, setSignupPasswordConfirmation] = useState('');

  const canSubmitLogin = useMemo(
    () => loginEmail.trim() !== '' && loginPassword.trim() !== '',
    [loginEmail, loginPassword],
  );

  const canSubmitSignup = useMemo(
    () =>
      username.trim() !== '' &&
      signupEmail.trim() !== '' &&
      signupPassword.trim() !== '' &&
      signupPasswordConfirmation.trim() !== '',
    [username, signupEmail, signupPassword, signupPasswordConfirmation],
  );

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmitLogin || loading) return;

    setLoading(true);
    setError('');

    try {
      const result = await postJson('/auth/login', {
        email: loginEmail,
        password: loginPassword,
      });

      window.location.href = result.redirect || defaultProfilePath;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmitSignup || loading) return;

    setLoading(true);
    setError('');

    try {
      const result = await postJson('/auth/register', {
        username,
        email: signupEmail,
        password: signupPassword,
        password_confirmation: signupPasswordConfirmation,
      });

      window.location.href = result.redirect || defaultProfilePath;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-page">
      <button className="back-btn-auth" onClick={() => (window.location.href = homePath)} type="button">
        <i className="fas fa-arrow-left"></i>
      </button>

      <button className="auth-theme-toggle" id="theme-btn" type="button" aria-label="Toggle theme">
        <i className="fas fa-fw fa-moon"></i>
      </button>

      {error ? (
        <div
          className="auth-errors"
          style={{
            position: 'fixed',
            top: '1rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: '9999',
            color: '#ff6b6b',
          }}
        >
          {error}
        </div>
      ) : null}

      <div className={`auth-half auth-left ${mode === 'signup' ? 'hidden' : ''}`} id="auth-left">
        <div className="auth-form-container">
          <div className="login" id="login-form">
            <h2>
              <i className="fa-solid fa-right-to-bracket"></i> Login
            </h2>
            <form onSubmit={handleLogin} noValidate>
              <input
                type="email"
                name="email"
                placeholder="Email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
              <button className="submit-btn" type="submit" id="login-button" disabled={!canSubmitLogin || loading}>
                <i className="fa-solid fa-right-to-bracket"></i>
                {loading ? 'Please wait...' : 'Sign in'}
              </button>
            </form>
            <a href="#" className="forgot-link" onClick={(e) => e.preventDefault()}>
              Forgot Password?
            </a>
            <p className="switch-text">
              Don't have an account?
              <button className="switch-btn" onClick={() => setMode('signup')} type="button">
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>

      <div className={`auth-half auth-right ${mode === 'login' ? 'hidden' : ''}`} id="auth-right">
        <div className="auth-form-container">
          <div className="signup" id="signup-form">
            <h2>
              <i className="fa-solid fa-user-plus"></i> Register
            </h2>
            <form onSubmit={handleSignup} noValidate>
              <input
                type="text"
                name="username"
                placeholder="Username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                required
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                required
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
              />
              <input
                type="password"
                name="password_confirmation"
                placeholder="Verify Password"
                required
                value={signupPasswordConfirmation}
                onChange={(e) => setSignupPasswordConfirmation(e.target.value)}
              />
              <button className="submit-btn" type="submit" id="signup-button" disabled={!canSubmitSignup || loading}>
                <i className="fa-solid fa-user-plus"></i>
                {loading ? 'Please wait...' : 'Sign up'}
              </button>
            </form>
            <p className="switch-text">
              Already have an account?
              <button className="switch-btn" onClick={() => setMode('login')} type="button">
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>

      <div className={`auth-bg auth-bg-left ${mode === 'signup' ? 'active' : ''}`} id="bg-left"></div>
      <div className={`auth-bg auth-bg-right ${mode === 'login' ? 'active' : ''}`} id="bg-right"></div>
    </section>
  );
}
