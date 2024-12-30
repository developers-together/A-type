<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.00, minimum-scale=1.00, maximum-scale=1.00, user-scalable=no"
    />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Lexend+Deca:wght@100..900&display=swap"
      rel="stylesheet"
    />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=info"
    />
    <link
      href="https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,200..1000;1,200..1000&display=swap"
      rel="stylesheet"
    />
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css"
    />
    <link rel="stylesheet" href="css/login.css" />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=schedule"
    />
    <link
      rel="icon"
      type="image/x-icon"
      sizes="32x32"
      href="/assets/Logo/favicon/A-Type-Logo.ico"
    />
    <title>A-type | A minimalistic typing test website</title>
  </head>
  <body>
    <section class="header">
      <div>
        <img
          src="/assets/Logo/logo.svg"
          alt="logo"
          onclick="window.open('/', '_parent')"
        />
        <h1>A-Type</h1>
      </div>
      <div class="hsbtns">
        <button
          onclick="window.open('/leaderboard', '_parent')"
        >
          <div class="icon-container">
            <i class="fas fa-fw fa-crown fa-lg"></i>
          </div>
        </button>
        <button onclick="window.open('/info', '_parent')">
          <div class="icon-container">
            <i class="fas fa-fw fa-info fa-lg"></i>
          </div>
        </button>
      </div>
      <div class="hebtns">
        {{-- <button
          <button
          onclick="window.open('/profile', '_parent')"
        >
          <div class="icon-container">
            <i class="fa-regular fa-user"></i>
          </div>
        </button> --}}
        <button onclick="window.open('/login', '_parent')">
          <div class="icon-container">
            <i class="fas fa-fw fa-user fa-lg"></i>
          </div>
        </button>
      </div>
    </section>
    <section class="main">
      <div class="container">
        <div class="signup">
            @if(session()->has('error'))
            <div class="alert alert-danger">
                {{ session()->get('error') }}
            </div>
            @endif
          <pre><i class="fa-solid fa-user-plus"></i> Register</pre>
          <form id="signup-form" method="POST"
          action="{{ route('user.register') }}">
            @csrf
            <input type="text" name="name" placeholder="name" />
            <input type="email" name="email" placeholder="Email" />
            {{-- <input type="email" placeholder="Verify Email" /> --}}
            <input type="password" name="password" placeholder="Password" />
            <input type="password" placeholder="Verify Password" />
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
          <form method="POST" action="{{ route('user.login') }}">

            @csrf
            <input type="email" name="email" placeholder="Email" /> <br />
            <input type="password" name="password" placeholder="Password" /> <br />
            <div class="rememberme">
              <input type="checkbox" /> <label>Remember Me</label>
            </div>
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
    <script type="text/javascript" src="login.js"></script>
  </body>
</html>
