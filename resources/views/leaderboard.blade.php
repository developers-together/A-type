<!DOCTYPE html>
<html lang="en">
@include('includes.head')

<body>
  @include('includes.navbar')

  <section class="main">
    <div class="screen">
      <div class="leaderboard-container">
        <div class="containerhead">
          <div class="left-group">
            <span class="title">All Time Leaderboard</span>
          </div>
          <div class="filters">
            <div class="filter-buttons">
              <a href="{{ route('leaderboard', ['filter' => 'all_time']) }}" class="{{ $current_filter === 'all_time' ? 'active' : '' }}"><button>All Time</button></a>
              <a href="{{ route('leaderboard', ['filter' => 'daily']) }}" class="{{ $current_filter === 'daily' ? 'active' : '' }}"><button>Daily</button></a>
            </div>
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
                <th class="col3">Accuracy</th>
                <th class="col4">Date</th>
              </tr>
              @forelse ($time as $index => $row)
                <tr>
                  @if ($index === 0)
                    <td class="col1"><i class="fas fa-fw fa-crown fa-lg"></i></td>
                  @else
                    <td class="col1">{{ $index + 1 }}</td>
                  @endif
                  <td class="col2">{{ $row->username }}</td>
                  <td class="col3">{{ $row->wpm }}</td>
                  <td class="col3">{{ $row->accuracy }}%</td>
                  <td class="col4">{{ \Carbon\Carbon::parse($row->session_at)->format('Y/m/d') }}</td>
                </tr>
              @empty
                <tr><td colspan="5">No data available</td></tr>
              @endforelse
            </table>
          </div>

          <div class="rlist">
            <table>
              <caption>
                Words 10
              </caption>
              <tr>
                <th class="col1"><i class="fas fa-fw fa-hashtag"></i></th>
                <th class="col2">Name</th>
                <th class="col3">WPM</th>
                <th class="col3">Accuracy</th>
                <th class="col4">Date</th>
              </tr>
              @forelse ($words as $index => $row)
                <tr>
                  @if ($index === 0)
                    <td class="col1"><i class="fas fa-fw fa-crown fa-lg"></i></td>
                  @else
                    <td class="col1">{{ $index + 1 }}</td>
                  @endif
                  <td class="col2">{{ $row->username }}</td>
                  <td class="col3">{{ $row->wpm }}</td>
                  <td class="col3">{{ $row->accuracy }}%</td>
                  <td class="col4">{{ \Carbon\Carbon::parse($row->session_at)->format('Y/m/d') }}</td>
                </tr>
              @empty
                <tr><td colspan="5">No data available</td></tr>
              @endforelse
            </table>
          </div>
        </div>
      </div>
    </div>
  </section>

  @include('includes.footer')
</body>

</html>
