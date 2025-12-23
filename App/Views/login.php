<!DOCTYPE html>
<html lang="en">

<?php require_once '../App/Views/includes/head.php'; ?>

<body>
  <section class="auth-page">
    <!-- Back button -->
    <button class="back-btn-auth" onclick="history.back()">
      <i class="fas fa-arrow-left"></i>
    </button>
    
    <!-- Left half - Login form (default visible) -->
    <div class="auth-half auth-left" id="auth-left">
      <div class="auth-form-container">
        <div class="login" id="login-form">
          <h2><i class="fa-solid fa-right-to-bracket"></i> Login</h2>
          <form action="/Profile/login" method="post">
            <input type="email" name="email" placeholder="Email" required />
            <input type="password" name="password" placeholder="Password" required />
            <button class="submit-btn" type="submit">
              <i class="fa-solid fa-right-to-bracket"></i> Sign in
            </button>
          </form>
          <a href="" class="forgot-link">Forgot Password?</a>
          <p class="switch-text">
            Don't have an account? 
            <button class="switch-btn" onclick="showSignup()">Sign up</button>
          </p>
        </div>
      </div>
    </div>
    
    <!-- Right half - Signup form (hidden by default) -->
    <div class="auth-half auth-right hidden" id="auth-right">
      <div class="auth-form-container">
        <div class="signup" id="signup-form">
          <h2><i class="fa-solid fa-user-plus"></i> Register</h2>
          <form action="/Profile/register" method="post">
            <input type="text" name="username" placeholder="Username" required />
            <input type="email" name="email" placeholder="Email" required />
            <input type="password" name="password" placeholder="Password" required />
            <input type="password" name="verify_password" placeholder="Verify Password" required />
            <button class="submit-btn" type="submit">
              <i class="fa-solid fa-user-plus"></i> Sign up
            </button>
          </form>
          <p class="switch-text">
            Already have an account? 
            <button class="switch-btn" onclick="showLogin()">Sign in</button>
          </p>
        </div>
      </div>
    </div>
    
    <!-- Background panels -->
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

  <?php require_once '../App/Views/includes/footer.php'; ?>
</body>

</html>
