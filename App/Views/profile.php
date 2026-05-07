<!DOCTYPE html>
<html lang="en">
<?php require_once '../App/Views/includes/head.php'; ?>

<body>
  <?php require_once '../App/Views/includes/navbar.php'; ?>

  <section class="pmain">
    <div class="profile-layout">
      
      <!-- Left Sidebar - Profile Info -->
      <aside class="profile-sidebar">
        <div class="profile-avatar">
          <i class="fa-solid fa-circle-user"></i>
        </div>
        <h1 class="profile-username"><?php echo htmlspecialchars($data['user']['username']); ?></h1>
        <?php /* Level section - commented out for now
        <div class="profile-level">
          <span class="level-badge">Lvl 1</span>
          <div class="level-progress">
            <div class="level-bar"></div>
          </div>
          <span class="level-xp">0/100</span>
        </div>
        <div class="profile-joined">
          <i class="fa-solid fa-calendar"></i>
          <span>Joined Dec 2024</span>
        </div>
        */ ?>
      </aside>

      <!-- Center Content - Stats & Scores -->
      <main class="profile-content">
        
        <!-- Lifetime Stats -->
        <div class="stats-card">
          <h2 class="section-title has-tooltip">
            lifetime stats
            <span class="tooltip">Your all-time typing statistics</span>
          </h2>
          <div class="stats-grid">
            <div class="stat-box">
              <span class="stat-number has-tooltip">
                <?php echo $data['avg'][0]['total_tests'] ?? '0'; ?>
                <span class="tooltip">Total tests completed</span>
              </span>
              <span class="stat-name has-tooltip">
                total tests
                <span class="tooltip">Count of finished tests</span>
              </span>
            </div>
            <div class="stat-box">
              <span class="stat-number has-tooltip">
                <?php echo number_format($data['avg'][0]['total_words'] ?? 0); ?>
                <span class="tooltip">Total words typed</span>
              </span>
              <span class="stat-name has-tooltip">
                total words
                <span class="tooltip">Accumulated word count</span>
              </span>
            </div>
            <div class="stat-box">
              <?php 
                $totalTime = $data['avg'][0]['total_time'] ?? 0;
                $hours = floor($totalTime / 3600);
                $minutes = floor(($totalTime % 3600) / 60);
                $timeDisplay = $hours > 0 ? "{$hours}h {$minutes}m" : "{$minutes}m";
              ?>
              <span class="stat-number has-tooltip">
                <?php echo $timeDisplay; ?>
                <span class="tooltip">Total time spent typing</span>
              </span>
              <span class="stat-name has-tooltip">
                total time
                <span class="tooltip">Accumulated duration</span>
              </span>
            </div>
            <div class="stat-box highlight">
              <span class="stat-number has-tooltip">
                <?php echo round($data['avg'][0]['avg_wpm'] ?? 0); ?>
                <span class="tooltip">Average Words Per Minute</span>
              </span>
              <span class="stat-name has-tooltip">
                avg wpm
                <span class="tooltip">Mean typing speed</span>
              </span>
            </div>
            <div class="stat-box">
              <span class="stat-number has-tooltip">
                <?php echo round($data['avg'][0]['avg_acc'] ?? 0); ?>%
              <span class="tooltip">Average Accuracy</span>
              </span>
              <span class="stat-name has-tooltip">
                avg accuracy
                <span class="tooltip">Mean hitting precision</span>
              </span>
            </div>
            <div class="stat-box">
              <span class="stat-number has-tooltip">
                <?php echo isset($data['avg'][0]['best_wpm']) ? round($data['avg'][0]['best_wpm']) : 0; ?>
                <span class="tooltip">Highest WPM in a single test</span>
              </span>
              <span class="stat-name has-tooltip">
                best wpm
                <span class="tooltip">Personal best speed</span>
              </span>
            </div>
            <div class="stat-box">
              <span class="stat-number has-tooltip">
                <?php echo isset($data['avg'][0]['best_acc']) ? round($data['avg'][0]['best_acc']) : 0; ?>%
                <span class="tooltip">Highest accuracy in a single test</span>
              </span>
              <span class="stat-name has-tooltip">
                best accuracy
                <span class="tooltip">Personal best precision</span>
              </span>
            </div>
          </div>
        </div>
        
        <script>
          console.log("Profile Page | Load | Stats | <?php echo json_encode($data['stats']); ?>");
        </script>

        <?php if (false): ?>
        <!-- Best Scores -->
        <?php
          // Build lookup arrays for quick access
          $timeStats = [];
          $wordsStats = [];
          if (isset($data['stats']) && is_array($data['stats'])) {
            foreach ($data['stats'] as $stat) {
              if ($stat['mode'] == 'time') {
                $timeStats[$stat['amount']] = $stat;
              } else if ($stat['mode'] == 'words') {
                $wordsStats[$stat['amount']] = $stat;
              }
            }
          }
          // Standard amounts to display
          $timeAmounts = [15, 30, 60, 120];
          $wordsAmounts = [10, 25, 50, 100];
        ?>
        
        <div class="scores-row">
          <!-- Time Mode -->
          <div class="scores-card">
            <h3 class="scores-title has-tooltip">
              <i class="fa-solid fa-stopwatch"></i> time mode
              <span class="tooltip">Test your typing speed based on time</span>
            </h3>
            <div class="scores-items">
              <?php foreach ($timeAmounts as $amount): ?>
                <div class="score-box">
                  <span class="score-label has-tooltip">
                    <?php echo $amount; ?>s
                    <span class="tooltip">Time Duration</span>
                  </span>
                  <span class="score-wpm has-tooltip">
                    <?php echo isset($timeStats[$amount]) ? round($timeStats[$amount]['wpm']) : '-'; ?>
                    <span class="tooltip">Words Per Minute</span>
                  </span>
                  <span class="score-acc has-tooltip">
                    <?php echo isset($timeStats[$amount]) ? round($timeStats[$amount]['accuracy']) . '%' : '-'; ?>
                    <span class="tooltip">Accuracy</span>
                  </span>
                </div>
              <?php endforeach; ?>
            </div>
          </div>

          <!-- Words Mode -->
          <div class="scores-card">
            <h3 class="scores-title has-tooltip">
              <i class="fa-solid fa-align-left"></i> words mode
              <span class="tooltip">Test your typing speed based on words</span>
            </h3>
            <div class="scores-items">
              <?php foreach ($wordsAmounts as $amount): ?>
                <div class="score-box">
                  <span class="score-label has-tooltip">
                    <?php echo $amount; ?>
                    <span class="tooltip">Word Count</span>
                  </span>
                  <span class="score-wpm has-tooltip">
                    <?php echo isset($wordsStats[$amount]) ? round($wordsStats[$amount]['wpm']) : '-'; ?>
                    <span class="tooltip">Words Per Minute</span>
                  </span>
                  <span class="score-acc has-tooltip">
                    <?php echo isset($wordsStats[$amount]) ? round($wordsStats[$amount]['accuracy']) . '%' : '-'; ?>
                    <span class="tooltip">Accuracy</span>
                  </span>
                </div>
              <?php endforeach; ?>
            </div>
          </div>
        </div>
        <?php endif; ?>

        <!-- Danger Zone -->
        <div class="danger-zone">
          <h3 class="danger-title">danger zone</h3>
          <div class="danger-buttons">
            <button class="danger-btn reset-btn">
              <i class="fa-solid fa-rotate-left"></i>
              reset data
            </button>
            <button class="danger-btn delete-btn">
              <i class="fa-solid fa-trash"></i>
              delete account
            </button>
            <form action="/Profile/logout" method="post">
              <button type="submit" class="danger-btn logout-btn">
                <i class="fa-solid fa-right-from-bracket"></i>
                log out
              </button>
            </form>
          </div>
        </div>

      </main>
    </div>
  </section>

  <?php require_once '../App/Views/includes/footer.php'; ?>
  <div id="theme-transition" class="theme-transition hidden"></div>
</body>

</html>
