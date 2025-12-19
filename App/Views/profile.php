<!DOCTYPE html>
<html lang="en">
<?php require_once '../App/Views/includes/head.php'; ?>

<body>

  <?php require_once '../App/Views/includes/navbar.php'; ?>

  <section class="main">
    <div class="profile-container">
      <div class="personalinfo">
        <div class="pp">
          <i class="fa-solid fa-circle-user"></i>
        </div>
        <span class="span1"><?php echo $data['user']['username']; ?></span>

        <div class="text">
          <div class="level">
            <span class="span2">1</span>
            <div class="levelbar">--------------------</div>
            <span class="span3">0/100</span>
          </div>
        </div>
      </div>
        <?php
        echo "<div class='record'";

        // echo '<p class="p1"' . var_dump($data) . '</p>';
        echo "<p class='p1'>Total tests: <span>{$data['avg'][0]['total_tests']}</span></p>";

        echo "<p class='p2'>Total words: <span>{$data['avg'][0]['total_words']}</span></p>";

        echo "<p class='p3' Total Time: <span>{$data['avg'][0]['total_time']}</span></p>";

        echo "<p class='p4' Average WPM: <span> {$data['avg'][0]['avg_wpm']}</span></p>";

        echo "<p class='p4' Average acc: <span> {$data['avg'][0]['avg_acc']}</span></p>";

        echo "</div>";
        ?>

      <div class="tables">
        <table class="table1">
          <tr>
            <th>15s</th>
            <th>30s</th>
            <th>60s</th>
            <th>120s</th>
          </tr>
          <tr>
            <td>WPM</td>
            <td>WPM</td>
            <td>WPM</td>
            <td>WPM</td>
          </tr>
          <tr>
            <td>acc</td>
            <td>acc</td>
            <td>acc</td>
            <td>acc</td>
          </tr>
        </table>
        <table class="table2">
          <tr>
            <th>10W</th>
            <th>25W</th>
            <th>50W</th>
            <th>100W</th>
          </tr>
          <tr>
            <td>WPM</td>
            <td>WPM</td>
            <td>WPM</td>
            <td>WPM</td>
          </tr>
          <tr>
            <td>acc</td>
            <td>acc</td>
            <td>acc</td>
            <td>acc</td>
          </tr>
        </table>
      </div>
      <div class="buttons">
        <button><i class="fa-solid fa-trash"></i>delete account</button>

        <form action="/Profile/logout" method="post">
          <button><i class="fa-solid fa-user-minus"></i>Log out</button>
        </form>

        <button><i class="fa-solid fa-file-excel"></i>Reset Data</button>
      </div>
    </div>
  </section>

  <?php require_once '../App/Views/includes/footer.php'; ?>



  <!-- Add theme transition div -->
  <div id="theme-transition" class="theme-transition hidden"></div>
</body>

</html>
