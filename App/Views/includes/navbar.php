<!DOCTYPE html>
<html lang="en">
    <body>
        <section class="header">
            <div>
                <img
                    id="logo"
                    src="/assets/Logo/logo.svg"
                    alt="logo" />
                <h1>A-Type</h1>
            </div>
            <div class="hsbtns">
                <button
                    onclick="window.open('/Leaderboard', '_parent')">
                    <div class="icon-container">
                        <i class="fas fa-fw fa-crown fa-lg"></i>
                    </div>
                </button>
                <button onclick="window.open('/Info', '_parent')">
                    <div class="icon-container">
                        <i class="fas fa-fw fa-info fa-lg"></i>
                    </div>
                </button>
            </div>
            <div class="hebtns">
                <button id="theme-toggle">
                    <div class="icon-container">
                        <i class="fas fa-fw fa-moon fa-lg"></i>
                    </div>
                </button>
                <button onclick="window.open('/Profile', '_parent')">
                    <div class="icon-container">
                        <?php
                        if (isset($_SESSION['user_id'])) {
                            echo '<i class="fas fa-fw fa-user fa-lg"></i>';
                        } else {
                            echo '<i class="fa-regular fa-user"></i>';
                        }
                        ?>
                    </div>
                </button>
            </div>
        </section>
    </body>
</html>