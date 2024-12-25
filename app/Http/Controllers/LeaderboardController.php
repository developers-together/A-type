<?php

namespace App\Http\Controllers;
use App\Models\TypingSession;

use Illuminate\Http\Request;

class LeaderboardController extends Controller
{
    public function leaderboard($type)
    {
        if ($type == 'dialy'){
        $today = now()->startOfDay();
        $leaderboard15 = TypingSession::where('mode', 15)
            ->where('created_at', '>=', $today)
            ->orderBy('wpm', 'desc')
            ->limit(10)
            ->get(['user_id', 'wpm', 'created_at'])
            ->load('user'); // Ensure user relation is loaded

        $leaderboard60 = TypingSession::where('mode', 60)
            ->where('created_at', '>=', $today)
            ->orderBy('wpm', 'desc')
            ->limit(10)
            ->get(['user_id', 'wpm', 'created_at'])
            ->load('user'); // Ensure user relation is loaded

        // return view('leaderboard.daily', ['leaderboard' => $leaderboard15]);
        }
        elseif ($type == 'alltime'){

            $leaderboard15 = TypingSession::where('mode', 15)
            ->orderBy('wpm', 'desc')
            ->limit(10)
            ->get(['user_id', 'wpm', 'created_at'])
            ->load('user'); // Ensure user relation is loaded

        $leaderboard60 = TypingSession::where('mode', 60)
            ->orderBy('wpm', 'desc')
            ->limit(10)
            ->get(['user_id', 'wpm', 'created_at'])
            ->load('user'); // Ensure user relation is loaded

        return view('leaderboard.all_time', ['leaderboard' => $leaderboard15]);

        }

        else{
            return redirect()->route('leaderboard', ['type' => 'daily']);
        }


}

}
