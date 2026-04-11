<!DOCTYPE html>
<html lang="en">
@include('includes.head')

<body>
  @include('includes.navbar')

  <section class="pmain">
    <div class="profile-layout">
      <aside class="profile-sidebar">
        <div class="profile-avatar">
          <i class="fa-solid fa-circle-user"></i>
        </div>
        <h1 class="profile-username">{{ $user->username }}</h1>
      </aside>

      <main class="profile-content">
        @if (session('status'))
          <div style="margin-bottom: 1rem; color: #7ef29a;">{{ session('status') }}</div>
        @endif

        @if ($errors->any())
          <div style="margin-bottom: 1rem; color: #ff6b6b;">{{ $errors->first() }}</div>
        @endif

        <div class="stats-card">
          <h2 class="section-title has-tooltip">
            lifetime stats
            <span class="tooltip">Your all-time typing statistics</span>
          </h2>
          <div class="stats-grid">
            <div class="stat-box">
              <span class="stat-number has-tooltip">
                {{ (int) ($avg->total_tests ?? 0) }}
                <span class="tooltip">Total tests completed</span>
              </span>
              <span class="stat-name has-tooltip">
                tests
                <span class="tooltip">Count of finished tests</span>
              </span>
            </div>
            <div class="stat-box">
              <span class="stat-number has-tooltip">
                {{ number_format((int) ($avg->total_words ?? 0)) }}
                <span class="tooltip">Total words typed</span>
              </span>
              <span class="stat-name has-tooltip">
                words
                <span class="tooltip">Accumulated word count</span>
              </span>
            </div>
            <div class="stat-box">
              @php
                $totalTime = (int) ($avg->total_time ?? 0);
                $hours = intdiv($totalTime, 3600);
                $minutes = intdiv($totalTime % 3600, 60);
                $timeDisplay = $hours > 0 ? "{$hours}h {$minutes}m" : "{$minutes}m";
              @endphp
              <span class="stat-number has-tooltip">
                {{ $timeDisplay }}
                <span class="tooltip">Total time spent typing</span>
              </span>
              <span class="stat-name has-tooltip">
                time
                <span class="tooltip">Accumulated duration</span>
              </span>
            </div>
            <div class="stat-box highlight">
              <span class="stat-number has-tooltip">
                {{ round((float) ($avg->avg_wpm ?? 0)) }}
                <span class="tooltip">Average Words Per Minute</span>
              </span>
              <span class="stat-name has-tooltip">
                avg wpm
                <span class="tooltip">Mean typing speed</span>
              </span>
            </div>
            <div class="stat-box">
              <span class="stat-number has-tooltip">
                {{ round((float) ($avg->avg_acc ?? 0)) }}%
                <span class="tooltip">Average Accuracy</span>
              </span>
              <span class="stat-name has-tooltip">
                accuracy
                <span class="tooltip">Mean hitting precision</span>
              </span>
            </div>
          </div>
        </div>

        @php
          $timeStats = [];
          $wordsStats = [];

          foreach ($stats as $stat) {
              if ($stat->mode === 'time') {
                  $timeStats[$stat->amount] = $stat;
              } elseif ($stat->mode === 'words') {
                  $wordsStats[$stat->amount] = $stat;
              }
          }

          $timeAmounts = [15, 30, 60, 120];
          $wordsAmounts = [10, 25, 50, 100];
        @endphp

        <div class="scores-row">
          <div class="scores-card">
            <h3 class="scores-title has-tooltip">
              <i class="fa-solid fa-stopwatch"></i> time mode
              <span class="tooltip">Test your typing speed based on time</span>
            </h3>
            <div class="scores-items">
              @foreach ($timeAmounts as $amount)
                <div class="score-box">
                  <span class="score-label has-tooltip">
                    {{ $amount }}s
                    <span class="tooltip">Time Duration</span>
                  </span>
                  <span class="score-wpm has-tooltip">
                    {{ isset($timeStats[$amount]) ? round((float) $timeStats[$amount]->wpm) : '-' }}
                    <span class="tooltip">Words Per Minute</span>
                  </span>
                  <span class="score-acc has-tooltip">
                    {{ isset($timeStats[$amount]) ? round((float) $timeStats[$amount]->accuracy).'%' : '-' }}
                    <span class="tooltip">Accuracy</span>
                  </span>
                </div>
              @endforeach
            </div>
          </div>

          <div class="scores-card">
            <h3 class="scores-title has-tooltip">
              <i class="fa-solid fa-align-left"></i> words mode
              <span class="tooltip">Test your typing speed based on words</span>
            </h3>
            <div class="scores-items">
              @foreach ($wordsAmounts as $amount)
                <div class="score-box">
                  <span class="score-label has-tooltip">
                    {{ $amount }}
                    <span class="tooltip">Word Count</span>
                  </span>
                  <span class="score-wpm has-tooltip">
                    {{ isset($wordsStats[$amount]) ? round((float) $wordsStats[$amount]->wpm) : '-' }}
                    <span class="tooltip">Words Per Minute</span>
                  </span>
                  <span class="score-acc has-tooltip">
                    {{ isset($wordsStats[$amount]) ? round((float) $wordsStats[$amount]->accuracy).'%' : '-' }}
                    <span class="tooltip">Accuracy</span>
                  </span>
                </div>
              @endforeach
            </div>
          </div>
        </div>

        <div class="stats-card" style="margin-top: 1.5rem;">
          <h2 class="section-title">Account Settings</h2>
          <form action="{{ route('profile.update') }}" method="post" style="display: grid; gap: 0.75rem; max-width: 520px;">
            @csrf
            @method('PUT')
            <input type="text" name="username" value="{{ old('username', $user->username) }}" required />
            <input type="email" name="email" value="{{ old('email', $user->email) }}" required />
            <input type="password" name="password" placeholder="New password (optional)" />
            <input type="password" name="password_confirmation" placeholder="Confirm new password" />
            <button type="submit" class="danger-btn reset-btn">Update Profile</button>
          </form>
        </div>

        <div class="danger-zone">
          <h3 class="danger-title">danger zone</h3>
          <div class="danger-buttons">
            <form action="{{ route('auth.logout') }}" method="post">
              @csrf
              <button type="submit" class="danger-btn logout-btn">
                <i class="fa-solid fa-right-from-bracket"></i>
                log out
              </button>
            </form>

            <form action="{{ route('profile.destroy') }}" method="post" style="display: grid; gap: 0.5rem;">
              @csrf
              @method('DELETE')
              <input type="password" name="current_password" placeholder="Current password" required />
              <button type="submit" class="danger-btn delete-btn">
                <i class="fa-solid fa-trash"></i>
                delete account
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  </section>

  @include('includes.footer')
  <div id="theme-transition" class="theme-transition hidden"></div>
</body>

</html>
