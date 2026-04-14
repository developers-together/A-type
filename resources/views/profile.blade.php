<!DOCTYPE html>
<html lang="en">
@include('includes.head')

<body>
  @include('includes.navbar')

  <section class="pmain">
    <div class="profile-layout">
      <aside class="profile-sidebar">
        <div class="profile-sidebar-card profile-identity">
          <div class="profile-avatar">
            <i class="fa-solid fa-circle-user"></i>
          </div>
          <h1 class="profile-username">{{ $user->username }}</h1>
          <p class="profile-joined">
            <i class="fa-regular fa-calendar"></i>
            joined {{ optional($user->created_at)->format('M j, Y') }}
          </p>
        </div>

        <div class="profile-sidebar-card">
          <h2 class="section-title sidebar-title">account settings</h2>
          <form action="{{ route('profile.update') }}" method="post" class="profile-form">
            @csrf
            @method('PUT')
            <input class="form-input" type="text" name="username" value="{{ old('username', $user->username) }}" placeholder="Username" required />
            <input class="form-input" type="email" name="email" value="{{ old('email', $user->email) }}" placeholder="Email" required />
            <input class="form-input" type="password" name="password" placeholder="New password (optional)" />
            <input class="form-input" type="password" name="password_confirmation" placeholder="Confirm new password" />
            <button type="submit" class="primary-btn">Update Profile</button>
          </form>
        </div>
      </aside>

      <main class="profile-content">
        @if (session('status'))
          <div class="profile-flash success">{{ session('status') }}</div>
        @endif

        @if ($errors->any())
          <div class="profile-flash error">{{ $errors->first() }}</div>
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

        <div class="stats-card notes-card">
          <h2 class="section-title">quick notes</h2>
          <p class="notes-helper">Create, edit, and delete profile notes. This is full CRUD on the `profile_notes` model.</p>

          <form action="{{ route('profile.notes.store') }}" method="post" class="profile-form note-create-form">
            @csrf
            <input class="form-input" type="text" name="title" placeholder="Note title" required maxlength="120" />
            <textarea class="form-input form-textarea" name="body" placeholder="Write a note..." rows="3" required maxlength="2000"></textarea>
            <label class="inline-toggle">
              <input type="hidden" name="is_pinned" value="0" />
              <input type="checkbox" name="is_pinned" value="1" />
              pin this note
            </label>
            <button type="submit" class="primary-btn">Add Note</button>
          </form>

          <div class="notes-list">
            @forelse ($notes as $note)
              <article class="note-item {{ $note->is_pinned ? 'is-pinned' : '' }}">
                <form action="{{ route('profile.notes.update', $note) }}" method="post" class="profile-form note-update-form">
                  @csrf
                  @method('PUT')
                  <input class="form-input" type="text" name="title" value="{{ $note->title }}" required maxlength="120" />
                  <textarea class="form-input form-textarea" name="body" rows="4" required maxlength="2000">{{ $note->body }}</textarea>

                  <div class="note-meta">
                    <span class="note-date">updated {{ optional($note->updated_at)->diffForHumans() }}</span>
                    <label class="inline-toggle">
                      <input type="hidden" name="is_pinned" value="0" />
                      <input type="checkbox" name="is_pinned" value="1" @checked($note->is_pinned) />
                      pinned
                    </label>
                  </div>

                  <div class="note-actions">
                    <button type="submit" class="primary-btn">Save</button>
                  </div>
                </form>

                <form action="{{ route('profile.notes.destroy', $note) }}" method="post" class="note-delete-form">
                  @csrf
                  @method('DELETE')
                  <button type="submit" class="danger-btn delete-btn">
                    <i class="fa-solid fa-trash"></i>
                    delete
                  </button>
                </form>
              </article>
            @empty
              <p class="notes-empty">No notes yet. Add your first one above.</p>
            @endforelse
          </div>
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

            <form action="{{ route('profile.destroy') }}" method="post" class="profile-form">
              @csrf
              @method('DELETE')
              <input class="form-input" type="password" name="current_password" placeholder="Current password" required />
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
