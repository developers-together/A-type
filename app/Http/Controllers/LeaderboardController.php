<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\BuildsFrontendProps;
use App\Models\TypingSession;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class LeaderboardController extends Controller
{
    use BuildsFrontendProps;

    public function index(Request $request)
    {
        $filter = $request->query('filter', 'all_time');

        if (! in_array($filter, ['all_time', 'daily'], true)) {
            $filter = 'all_time';
        }

        return $this->renderAppPage($request, 'leaderboard', [
            'time' => $this->topScores('time', 15, $filter)->map(fn ($row) => [
                'userId' => $row->user_id,
                'username' => $row->username,
                'wpm' => (int) $row->wpm,
                'accuracy' => (float) $row->accuracy,
                'sessionAt' => (string) $row->session_at,
            ])->values(),
            'words' => $this->topScores('words', 10, $filter)->map(fn ($row) => [
                'userId' => $row->user_id,
                'username' => $row->username,
                'wpm' => (int) $row->wpm,
                'accuracy' => (float) $row->accuracy,
                'sessionAt' => (string) $row->session_at,
            ])->values(),
            'filter' => $filter,
        ], 'Leaderboard');
    }

    private function topScores(string $mode, int $amount, string $filter): Collection
    {
        $query = TypingSession::query()
            ->join('users', 'users.id', '=', 'typing_sessions.user_id')
            ->where('typing_sessions.mode', $mode)
            ->where('typing_sessions.amount', $amount)
            ->orderByDesc('typing_sessions.wpm')
            ->orderByDesc('typing_sessions.accuracy')
            ->orderByDesc('typing_sessions.session_at')
            ->select([
                'typing_sessions.user_id',
                'typing_sessions.wpm',
                'typing_sessions.accuracy',
                'typing_sessions.mode',
                'typing_sessions.session_at',
                'users.username',
            ]);

        if ($filter === 'daily') {
            $query->whereDate('typing_sessions.session_at', today());
        }

        return $query
            ->get()
            ->groupBy('user_id')
            ->map(fn (Collection $sessions) => $sessions->first())
            ->sort(function ($a, $b): int {
                if ((int) $a->wpm === (int) $b->wpm) {
                    return (float) $b->accuracy <=> (float) $a->accuracy;
                }

                return (int) $b->wpm <=> (int) $a->wpm;
            })
            ->take(10)
            ->values();
    }
}
