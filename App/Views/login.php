<!DOCTYPE html>
<html lang="en">

<?php require_once '../App/Views/includes/head.php'; ?>

<body>

  <?php require_once '../App/Views/includes/navbar.php'; ?>

  <section class="main">
    <div class="login-container">
      <div class="signup">
        <pre><i class="fa-solid fa-user-plus"></i> Register</pre>
        <form id="signup-form" action="/Profile/register" method="post">
          <input type="text" name="username" placeholder="username" />
          <input type="email" name="email" placeholder="Email" />
          <!-- <input type="email" name="verify_email" placeholder="Verify Email" /> -->
          <input type="password" name="password" placeholder="Password" />
          <input type="password" name="verify_password" placeholder="Verify Password" />
          <button class="button" id="signup-button" type="submit">
            <pre><i class="fa-solid fa-user-plus"></i> Sign up</pre>
            <!-- <input type="submit" value="" hidden /> -->
          </button>
        </form>
      </div>
      <div class="login" id="login-form">
        <pre><i class="fa-solid fa-right-to-bracket"></i> Login</pre>
        <div class="auth">
          <button>
            <i class="fa-brands fa-google"></i>
          </button>
          <button>
            <i class="fa-brands fa-github"></i>
          </button>
        </div>
        <div class="or-line">
          <div class="hr"></div>
          <pre> or </pre>
          <div class="hr"></div>
        </div>
        <form action="/Profile/login" method="post">
          <input type="email" name="email" placeholder="Email" /> <br />
          <input type="password" name="password" placeholder="Password" /> <br />
          <!-- <div class="rememberme">
              <input type="checkbox" /> <label>Remember Me</label>
            </div> -->
          <br />
          <button class="button" id="login-button" type="submit">
            <pre><i class="fa-solid fa-right-to-bracket"></i> Sign in</pre>
          </button>
          <br />
        </form>
        <a href="" target="">Reset Password?</a>
      </div>
    </div>
  </section>

  <?php require_once '../App/Views/includes/footer.php'; ?>



</body>

</html>
