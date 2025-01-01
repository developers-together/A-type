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
    <link rel="stylesheet" href="../css/leaderboard.css" />
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
        <button onclick="window.open('/login', '_parent')">
          <div class="icon-container">
            <i class="fas fa-fw fa-user fa-lg"></i>
          </div>
        </button>
      </div>
    </section>
    <section class="main">
      <div class="screen">
        <div class="container">
          <div class="containerhead">
            <div class="left-group">
              <span class="title">All Time Leaderboard</span>
              <span class="span">next update:</span>
            </div>
            <div class="filters">
              <div class="buttons">
                <button onclick="window.open('/leaderboard/alltime', '_parent')" >All Time</button>
                <button onclick="window.open('/leaderboard/daily', '_parent')">Daily</button>
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
                @foreach ($leaderboard15 as $index => $session)
                    <tr>
                        <td class="col1 {{ $index === 0 ? 'first' : ($index === 1 ? 'second' : ($index === 2 ? 'third' : '')) }}">
                            {{ $index + 1 }}<i class="fas fa-fw fa-crown fa-lg"></i>
                        </td>
                        <td class="col2">{{ $session->user->name }}</td>
                        <td class="col3">{{ $session->wpm }}</td>
                        <td class="col4">{{ $session->created_at }}</td>
                    </tr>
                @endforeach

              </table>
            </div>
            <div class="rlist">
              <table>
                <caption>
                  Time 60
                </caption>
                <tr>
                  <th class="col1"><i class="fas fa-fw fa-hashtag"></i></th>
                  <th class="col2">Name</th>
                  <th class="col3">WPM</th>
                  <th class="col4">Date</th>
                </tr>
                @foreach ($leaderboard60 as $index => $session)
                <tr>
                    <td class="col1 {{ $index === 0 ? 'first' : ($index === 1 ? 'second' : ($index === 2 ? 'third' : '')) }}">
                        {{ $index + 1 }}<i class="fas fa-fw fa-crown fa-lg"></i>
                    </td>
                    <td class="col2">{{ $session->user->name }}</td>
                    <td class="col3">{{ $session->wpm }}</td>
                    <td class="col4">{{ $session->created_at }}</td>
                </tr>
            @endforeach

              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  </body>
</html>
