<!DOCTYPE html>
<html lang="en">

<?php
$canvasMode = defined('CANVAS_RENDERER') && CANVAS_RENDERER;
$LOAD_CANVAS_SCRIPT = $canvasMode;
require_once '../App/Views/includes/head.php';
?>

<body>

  <?php require_once '../App/Views/includes/navbar.php'; ?>

  <?php if ($canvasMode): ?>
    <script>
      window.__ATYPE_AUTH__ = <?php echo isset($_SESSION['user_id']) ? 'true' : 'false'; ?>;
      window.__ATYPE_USER__ = <?php echo isset($_SESSION['user_id'])
        ? json_encode(['id' => $_SESSION['user_id']])
        : 'null'; ?>;
    </script>

    <section class="main" id="main">
      <div id="renderer-host" style="position: relative; width: 100%; height: 100vh; overflow: hidden;">
        <canvas id="atype-canvas" style="display: block; width: 100%; height: 100%;"></canvas>
        <input
          id="atype-input"
          type="text"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          aria-hidden="true"
          tabindex="-1"
          style="position:absolute;opacity:0;top:0;left:0;width:100%;height:100%;pointer-events:none;border:none;outline:none;background:transparent;" />
      </div>
    </section>
  <?php else: ?>
    <section class="main" id="main">
      <div class="container" id="container">
        <div class="controls-line">
          <div class="timer hidden" id="timer">
            <p class="timernum">15s</p>
          </div>
          <div class="controls">
            <!-- Pill 1: Mode buttons (always visible) -->
            <div class="buttons buttons-main">
              <button class="punctuation-button" id="punctuation">
                <i class="fas fa-fw fa-at"></i>
                Punctuation
              </button>
              <button class="numbers-button" id="numbers">
                <i class="fas fa-fw fa-hashtag"></i>
                Numbers
              </button>
              <div class="hhr"></div>
              <button class="time-button" id="time-button">
                <i class="fas fa-fw fa-clock"></i>
                Time
              </button>
              <button class="words-button active" id="words-button">
                <i class="fas fa-fw fa-font"></i>
                Words
              </button>
            </div>
            <!-- Pill 2: Number options (visible for Words mode by default) -->
            <div class="buttons buttons-numbers visible" id="buttons-numbers">
              <button class="btn1 active" id="btn1">10</button>
              <button class="btn2" id="btn2">25</button>
              <button class="btn3" id="btn3">50</button>
              <button class="btn4" id="btn4">100</button>
            </div>
            <div class="mobile-button">
              <i class="fas fa-bars"></i>
              <pre> Controls</pre>
            </div>
          </div>
        </div>
        <div class="typing-area" id="area">
          <span class="typing-lines" id="words"> </span>
        </div>
        <div class="reset">
          <button>
            <i id="reset-button" class="fas fa-rotate-right"></i>
          </button>
        </div>
      </div>
      <div class="mobile-menu hidden" id="mobileMenu">
        <button class="punctuation-mobile" id="punctuation-mobile">
          <i class="fas fa-fw fa-at"></i>
          Punctuation
        </button>
        <button class="numbers-mobile" id="numbers-mobile">
          <i class="fas fa-fw fa-hashtag"></i>
          Numbers
        </button>
        <div class="hhr2"></div>
        <button class="time-mobile" id="time-mobile">
          <i class="fas fa-fw fa-clock"></i>
          Time
        </button>
        <button class="words-mobile" id="words-mobile">
          <i class="fas fa-fw fa-font"></i>
          Words
        </button>
        <div class="hhr2"></div>
        <button id="btn1-mobile">15</button>
        <button id="btn2-mobile">30</button>
        <button id="btn3-mobile">60</button>
        <button id="btn4-mobile">120</button>
      </div>
      <div id="container2">
        <div class="container2">
          <div class="list">
            <table>
              <tr>
                <th>wpm</th>
                <th>raw wpm</th>
                <th>characters</th>
                <th>acc</th>
                <th>time</th>
              </tr>
              <tr>
                <td id="wpm" data-label="wpm"></td>
                <td id="rawwpm" data-label="raw wpm"></td>
                <td class="hover" id="characters" data-label="characters">
                  <span class="tooltip">correct / incorrect / extra / missed</span>
                </td>
                <td id="acc" data-label="acc"></td>
                <td id="time" data-label="time"></td>
              </tr>
            </table>
          </div>
        </div>
        <div class="back-btn">
          <button id="back-button">
            <i class="fa-solid fa-angle-left"></i>
          </button>
        </div>
      </div>
    </section>
  <?php endif; ?>

  <?php require_once '../App/Views/includes/footer.php'; ?>
</body>

</html>
