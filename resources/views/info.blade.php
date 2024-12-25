<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
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
      href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
    />
    <link
      href="https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,200..1000;1,200..1000&display=swap"
      rel="stylesheet"
    />
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css"
    />
    <link
      rel="icon"
      type="image/x-icon"
      sizes="32x32"
      href="/assets/Logo/favicon/A-Type-Logo.ico"
    />
    <link rel="stylesheet" href="css/info.css" />
    <title>A-type | Info</title>
    <meta
      name="description"
      content="Learn how to use A-Type, a minimalistic typing test website. Improve your typing speed and accuracy."
    />
    <meta
      name="keywords"
      content="typing speed test, typing test, wpm, minimalistic typing website, instructions"
    />
    <meta property="og:title" content="A-Type | Info" />
    <meta property="og:type" content="website" />
    <script type="module" src="info.js" defer></script>
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
        <button onclick="window.open('/login', '_parent')">
          <div class="icon-container">
            <i class="fas fa-fw fa-user fa-lg"></i>
          </div>
        </button>
      </div>
    </section>
    <section class="main">
      <div class="container">
        <div class="about">
          <h2><i class="fas fa-info-circle"></i> About</h2>
          <p>
            Welcome to A-Type! This website helps you improve your typing speed
            and accuracy in a minimalistic and intuitive environment. It is
            designed for everyone, from beginners to experienced typists.
          </p>
        </div>
        <div class="how">
          <h2><i class="fa-solid fa-lightbulb"></i> How to Use</h2>
          <p>1. On the main page, select your preferences:</p>
          <ul>
            <li>
              Toggle <b>Punctuation</b> (<i class="fas fa-at"></i>) or
              <b>Numbers</b> (<i class="fas fa-hashtag"></i>).
            </li>
            <li>
              Switch between <b>Time</b> (<i class="fas fa-clock"></i>) or
              <b>Words</b> (<i class="fas fa-font"></i>) mode.
            </li>
            <li>Choose a duration/word count (e.g., 10, 25, 50, 100).</li>
          </ul>
          <p>
            2. Start typing the displayed text in the typing area.<br />
            3. Press the "Tab" key at any time to instantly reset the test.<br />
            4. Your typing speed is measured in <b>WPM (Words Per Minute)</b>.
            Keep practicing to improve!
          </p>
        </div>
        <div class="availablility">
          <h2><i class="fas fa-globe"></i> Availability &amp; Compatibility</h2>
          <p>
            A-Type uses native HTML, CSS, and JavaScript. It runs on any
            computer and browser. The design is fully responsive, adapting to
            mobile, tablet, and laptop screens. Please note: You cannot use this
            app offline.
          </p>
        </div>
        <div class="github">
          <h2><i class="fas fa-code"></i> GitHub Repository</h2>
          <p>
            Check out the source code on GitHub:
            <a
              href="https://github.com/developers-together/A-type"
              target="_blank"
              ><i class="fa-brands fa-github github-icon"></i>A-type</a
            >
          </p>
        </div>
        <div class="stat">
          <h2><i class="fas fa-users"></i> Usage Statistics</h2>
          <p>Tests completed by users: <span id="test-count">0</span></p>
        </div>
        <div class="cost">
          <h2><i class="fas fa-money-bill-alt"></i> Cost</h2>
          <p>
            This website is completely free to use. No subscriptions, no hidden
            fees.
          </p>
        </div>
        <div class="dev">
          <h2><i class="fas fa-user-friends"></i> Developers</h2>
          <p>Meet the team behind A-Type:</p>
          <h3>
            <button class="collapsible-btn" data-target="#web-project-content">
              Web Project
            </button>
          </h3>
          <div id="web-project-content" class="hidden">
            <ul>
              <li>Abdallah elrouby - 320230016</li>
              <li>Adham haitham - 320230021</li>
              <li>Ahmed mohamed - 320230062</li>
              <li>Ezzeldin Shadi - 320220038</li>
              <li>Mohamed adham - 320230001</li>
              <li>Mohamed hussein - 320230008</li>
              <li>Omar sayed - 320230020</li>
              <li>Shehab mohamed - 320230009</li>
              <li>Ziad elsayed - 320230025</li>
              <li>Ziad gaber - 320230015</li>
            </ul>
          </div>
          <h3>
            <button
              class="collapsible-btn"
              data-target="#software-project-content"
            >
              Software Project
            </button>
          </h3>
          <div id="software-project-content" class="hidden">
            <ul>
              <li>Adham haitham - 320230021</li>
              <li>Mohamed adham - 320230001</li>
              <li>Mohamed hussein - 320230008</li>
              <li>Shehab mohamed - 320230009</li>
              <li>Ziad elsayed - 320230025</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  </body>
</html>
