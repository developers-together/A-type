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
          <h2 class="section-title">lifetime stats</h2>
          <div class="stats-grid">
            <div class="stat-box">
              <span class="stat-number"><?php echo $data['avg'][0]['total_tests'] ?? '0'; ?></span>
              <span class="stat-name">tests</span>
            </div>
            <div class="stat-box">
              <span class="stat-number"><?php echo number_format($data['avg'][0]['total_words'] ?? 0); ?></span>
              <span class="stat-name">words</span>
            </div>
            <div class="stat-box">
              <?php 
                $totalTime = $data['avg'][0]['total_time'] ?? 0;
                $hours = floor($totalTime / 3600);
                $minutes = floor(($totalTime % 3600) / 60);
                $timeDisplay = $hours > 0 ? "{$hours}h {$minutes}m" : "{$minutes}m";
              ?>
              <span class="stat-number"><?php echo $timeDisplay; ?></span>
              <span class="stat-name">time</span>
            </div>
            <div class="stat-box highlight">
              <span class="stat-number"><?php echo round($data['avg'][0]['avg_wpm'] ?? 0); ?></span>
              <span class="stat-name">avg wpm</span>
            </div>
            <div class="stat-box">
              <span class="stat-number"><?php echo round($data['avg'][0]['avg_acc'] ?? 0); ?>%</span>
              <span class="stat-name">accuracy</span>
            </div>
          </div>
        </div>

        <!-- Best Scores -->
        <?php
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
          $timeAmounts = [15, 30, 60, 120];
          $wordsAmounts = [10, 25, 50, 100];
        ?>
        
        <div class="scores-row">
          <!-- Time Mode -->
          <div class="scores-card">
            <h3 class="scores-title"><i class="fa-solid fa-stopwatch"></i> time mode</h3>
            <div class="scores-items">
              <?php foreach ($timeAmounts as $amount): ?>
                <div class="score-box">
                  <span class="score-label"><?php echo $amount; ?>s</span>
                  <span class="score-wpm"><?php echo isset($timeStats[$amount]) ? round($timeStats[$amount]['wpm']) : '-'; ?></span>
                  <span class="score-acc"><?php echo isset($timeStats[$amount]) ? round($timeStats[$amount]['accuracy']) . '%' : '-'; ?></span>
                </div>
              <?php endforeach; ?>
            </div>
          </div>

          <!-- Words Mode -->
          <div class="scores-card">
            <h3 class="scores-title"><i class="fa-solid fa-align-left"></i> words mode</h3>
            <div class="scores-items">
              <?php foreach ($wordsAmounts as $amount): ?>
                <div class="score-box">
                  <span class="score-label"><?php echo $amount; ?></span>
                  <span class="score-wpm"><?php echo isset($wordsStats[$amount]) ? round($wordsStats[$amount]['wpm']) : '-'; ?></span>
                  <span class="score-acc"><?php echo isset($wordsStats[$amount]) ? round($wordsStats[$amount]['accuracy']) . '%' : '-'; ?></span>
                </div>
              <?php endforeach; ?>
            </div>
          </div>
        </div>

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
