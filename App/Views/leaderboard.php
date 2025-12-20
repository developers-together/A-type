<!DOCTYPE html>
<html lang="en">
<?php require_once '../App/Views/includes/head.php'; ?>

<body>

  <?php require_once '../App/Views/includes/navbar.php'; ?>

  <section class="main">
    <div class="screen">
      <div class="leaderboard-container">
        <div class="containerhead">
          <div class="left-group">
            <span class="title">All Time Leaderboard</span>
            <span class="span">next update:</span>
          </div>
          <div class="filters">
            <div class="filter-buttons">
              <button>All Time</button>
              <button>Daily</button>
            </div>
            <select name="languages">
              <option>English</option>
              <option>Spanish</option>
              <option>Italian</option>
            </select>
          </div>
        </div>
        <div class="lists">
          <div class="llist">
            <table>
              <caption>
                Time 15
              </caption>
              <tr>
                <th class="col1"><i class="fas fa-fw fa-hashtag"></i></th>
                <th class="col2">Name</th>
                <th class="col3">WPM</th>
                <th class="col4">Date</th>
              </tr>
              <?php
              if (!empty($data['time'])) {
                  $i = 1;
                  foreach ($data['time'] as $row) {
                      echo "<tr>";
                      if ($i == 1) {
                          echo "<td class='col1'><i class='fas fa-fw fa-crown fa-lg'></i></td>";
                      } else {
                          echo "<td class='col1'>{$i}</td>";
                      }
                      echo "<td class='col2'>" . htmlspecialchars($row['username']) . "</td>";
                      echo "<td class='col3'>{$row['wpm']}</td>";
                      echo "<td class='col4'>" . date('Y/m/d', strtotime($row['session_at'])) . "</td>";
                      echo "</tr>";
                      $i++;
                  }
              } else {
                  echo "<tr><td colspan='4'>No data available</td></tr>";
              }
              ?>
            </table>
          </div>
          <div class="rlist">
            <table>
              <caption>
                Words 15
              </caption>
              <tr>
                <th class="col1"><i class="fas fa-fw fa-hashtag"></i></th>
                <th class="col2">Name</th>
                <th class="col3">WPM</th>
                <th class="col4">Date</th>
              </tr>
              <?php
              if (!empty($data['words'])) {
                  $i = 1;
                  foreach ($data['words'] as $row) {
                      echo "<tr>";
                      if ($i == 1) {
                          echo "<td class='col1'><i class='fas fa-fw fa-crown fa-lg'></i></td>";
                      } else {
                          echo "<td class='col1'>{$i}</td>";
                      }
                      echo "<td class='col2'>" . htmlspecialchars($row['username']) . "</td>";
                      echo "<td class='col3'>{$row['wpm']}</td>";
                      echo "<td class='col4'>" . date('Y/m/d', strtotime($row['session_at'])) . "</td>";
                      echo "</tr>";
                      $i++;
                  }
              } else {
                  echo "<tr><td colspan='4'>No data available</td></tr>";
              }
              ?>
            </table>
          </div>
        </div>
      </div>
    </div>
  </section>

  <?php require_once '../App/Views/includes/footer.php'; ?>


</body>

</html>
