<!DOCTYPE html>
<html lang="en">

@include('includes.head')

<body>
  <section class="auth-page">
    <button class="back-btn-auth" onclick="window.location.href='{{ route('home') }}'">
      <i class="fas fa-arrow-left"></i>
    </button>

    @if ($errors->any())
      <div class="auth-errors" style="position: fixed; top: 1rem; left: 50%; transform: translateX(-50%); z-index: 9999; color: #ff6b6b;">
        {{ $errors->first() }}
      </div>
    @endif

    <div class="auth-half auth-left" id="auth-left">
      <div class="auth-form-container">
        <div class="login" id="login-form">
          <h2><i class="fa-solid fa-right-to-bracket"></i> Login</h2>
          <form action="{{ route('auth.login') }}" method="post">
            @csrf
            <input type="email" name="email" placeholder="Email" required value="{{ old('email') }}" />
            <input type="password" name="password" placeholder="Password" required />
            <button class="submit-btn" type="submit" id="login-button">
              <i class="fa-solid fa-right-to-bracket"></i> Sign in
            </button>
          </form>
          <a href="#" class="forgot-link">Forgot Password?</a>
          <p class="switch-text">
            Don't have an account?
            <button class="switch-btn" onclick="showSignup()" type="button">Sign up</button>
          </p>
        </div>
      </div>
    </div>

    <div class="auth-half auth-right hidden" id="auth-right">
      <div class="auth-form-container">
        <div class="signup" id="signup-form">
          <h2><i class="fa-solid fa-user-plus"></i> Register</h2>
          <form action="{{ route('auth.register') }}" method="post">
            @csrf
            <input type="text" name="username" placeholder="Username" required value="{{ old('username') }}" />
            <input type="email" name="email" placeholder="Email" required value="{{ old('email') }}" />
            <input type="password" name="password" placeholder="Password" required />
            <input type="password" name="password_confirmation" placeholder="Verify Password" required />
            <button class="submit-btn" type="submit" id="signup-button">
              <i class="fa-solid fa-user-plus"></i> Sign up
            </button>
          </form>
          <p class="switch-text">
            Already have an account?
            <button class="switch-btn" onclick="showLogin()" type="button">Sign in</button>
          </p>
        </div>
      </div>
    </div>

    <div class="auth-bg auth-bg-left" id="bg-left"></div>
    <div class="auth-bg auth-bg-right" id="bg-right"></div>
  </section>

  <script>
    function showSignup() {
      document.getElementById('auth-left').classList.add('hidden');
      document.getElementById('auth-right').classList.remove('hidden');
      document.getElementById('bg-left').classList.add('active');
      document.getElementById('bg-right').classList.remove('active');
    }

    function showLogin() {
      document.getElementById('auth-right').classList.add('hidden');
      document.getElementById('auth-left').classList.remove('hidden');
      document.getElementById('bg-right').classList.add('active');
      document.getElementById('bg-left').classList.remove('active');
    }
  </script>

  @include('includes.footer')
</body>

</html>
