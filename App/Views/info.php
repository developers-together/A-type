<!DOCTYPE html>
<html lang="en">

<?php require_once '../App/Views/includes/head.php'; ?>

<body>

  <?php require_once '../App/Views/includes/navbar.php'; ?>

  <section class="main">
    <div class="info-container">
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
            target="_blank"><i class="fa-brands fa-github github-icon"></i>A-type</a>
        </p>
      </div>
    </div>
  </section>

  <?php require_once '../App/Views/includes/footer.php'; ?>

</body>

</html>
