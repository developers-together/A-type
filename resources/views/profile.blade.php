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
    <link rel="stylesheet" href="css/profile.css" />
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
      <div class="container">
        <div class="personalinfo">
          <div class="pp">
            <i class="fa-solid fa-circle-user"></i>
          </div>
          <span class="span1">{{$username}}</span>
          <div class="text">
            <div class="level">
              <span class="span2">1</span>
              <div class="levelbar">--------------------</div>
              <span class="span3">0/100</span>
            </div>
          </div>
        </div>
        <div class="record">
          <p class="p1">Total Typing sessions: <span>{{$totalcount}}</span></p>
          {{-- <p class="p2">Tests Finished: <span>2</span></p> --}}
          {{-- <p class="p3">Total Words: <span>3</span></p> --}}
          {{-- <p class="p4">Total Time: <span>4</span></p> --}}
          <p class="p5">Highest WPM: <span>{{$highestwpm->wpm}}</span></p>
          <p class="p6">Highest acc: <span>{{$hightestaccuracy->accuracy}}</span></p>
        </div>
        <div class="tables">
          <table class="table1">
            <tr>
              <th>15s</th>
              <th>30s</th>
              <th>60s</th>
              <th>120s</th>
            </tr>
            <tr>
              @isset($duration15)
                <td>{{$duration15->wpm}}</td>
              @endisset
              @isset($duration30)
                <td>{{$duration30->wpm}}</td>
              @endisset
              @isset($duration60)
                <td>{{$duration60->wpm}}</td>
              @endisset
              @isset($duration120)
                <td>{{$duration120->wpm}}</td>
              @endisset
            </tr>
            <tr>
              @isset($duration15)
                <td>{{$duration15->accuracy}}</td>
              @endisset
              @isset($duration30)
                <td>{{$duration30->accuracy}}</td>
              @endisset
              @isset($duration60)
                <td>{{$duration60->accuracy}}</td>
              @endisset
              @isset($duration120)
                <td>{{$duration120->accuracy}}</td>
              @endisset
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
              @isset($wordcount10)
                <td>{{$wordcount10->wpm}}</td>
              @endisset
              @isset($wordcount25)
                <td>{{$wordcount25->wpm}}</td>
              @endisset
              @isset($wordcount50)
                <td>{{$wordcount50->wpm}}</td>
              @endisset
              @isset($wordcount100)
                <td>{{$wordcount100->wpm}}</td>
              @endisset
            </tr>
            <tr>
              @isset($wordcount10)
                <td>{{$wordcount10->accuracy}}</td>
              @endisset
              @isset($wordcount25)
                <td>{{$wordcount25->accuracy}}</td>
              @endisset
              @isset($wordcount50)
                <td>{{$wordcount50->accuracy}}</td>
              @endisset
              @isset($wordcount100)
                <td>{{$wordcount100->accuracy}}</td>
              @endisset
            </tr>
          </table>
        </div>
        <div class="buttons">
          <form action="{{ route('delete') }}" method="POST" style="display:inline;">
            @csrf
            @method('DELETE')
            <button type="submit"><i class="fa-solid fa-trash"></i>Delete Account</button>
          </form>

          <form action="{{ route('logout') }}" method="POST" style="display:inline;">
            @csrf
            <button type="submit"><i class="fa-solid fa-user-minus"></i>Log out</button>
          </form>

          <form action="{{ route('resetdata') }}" method="POST" style="display:inline;">
            @csrf
            <button type="submit"><i class="fa-solid fa-file-excel"></i>Reset Data</button>
          </form>
        </div>
      </div>
    </section>
  </body>
</html>
