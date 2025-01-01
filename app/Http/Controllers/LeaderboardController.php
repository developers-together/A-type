<?php

namespace App\Http\Controllers;
use App\Models\TypingSession;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class LeaderboardController extends Controller
{
    public function leaderboard($type)
    {
        if ($type == 'daily'){
        $today = now()->startOfDay();
        $leaderboard15 = TypingSession::select('user_id', 'wpm', 'created_at')
            ->where('duration', 15)
            ->where('created_at', '>=', $today)
            ->whereIn('id', function($query) {
                $query->select(DB::raw('MAX(id)'))
                      ->from('typing_sessions')
                      ->where('duration', 15)
                      ->groupBy('user_id');
            })
            ->orderBy('wpm', 'desc')
            ->limit(10)
            ->get()
            ->load('user'); // Ensure user relation is loaded

        $leaderboard30 = TypingSession::select('user_id', 'wpm', 'created_at')
            ->where('duration', 30)
            ->where('created_at', '>=', $today)
            ->whereIn('id', function($query) {
                $query->select(DB::raw('MAX(id)'))
                      ->from('typing_sessions')
                      ->where('duration', 30)
                      ->groupBy('user_id');
            })
            ->orderBy('wpm', 'desc')
            ->limit(10)
            ->get()
            ->load('user'); // Ensure user relation is loaded

        $leaderboard60 = TypingSession::select('user_id', 'wpm', 'created_at')
            ->where('duration', 60)
            ->where('created_at', '>=', $today)
            ->whereIn('id', function($query) {
                $query->select(DB::raw('MAX(id)'))
                      ->from('typing_sessions')
                      ->where('duration', 60)
                      ->groupBy('user_id');
            })
            ->orderBy('wpm', 'desc')
            ->limit(10)
            ->get()
            ->load('user'); // Ensure user relation is loaded

        $leaderboard120 = TypingSession::select('user_id', 'wpm', 'created_at')
            ->where('duration', 120)
            ->where('created_at', '>=', $today)
            ->whereIn('id', function($query) {
                $query->select(DB::raw('MAX(id)'))
                      ->from('typing_sessions')
                      ->where('duration', 120)
                      ->groupBy('user_id');
            })
            ->orderBy('wpm', 'desc')
            ->limit(10)
            ->get()
            ->load('user'); // Ensure user relation is loaded

        return response()->view('leaderboard', ['leaderboard15' => $leaderboard15,
        'leaderboard30' => $leaderboard30,
        'leaderboard60' => $leaderboard60,
        'leaderboard120' => $leaderboard120]);
        }
        elseif ($type == 'alltime'){

            $leaderboard15 = TypingSession::select('user_id', 'wpm', 'created_at')
            ->where('duration', 15)
            ->whereIn('id', function($query) {
                $query->select(DB::raw('MAX(id)'))
                      ->from('typing_sessions')
                      ->where('duration', 15)
                      ->groupBy('user_id');
            })
            ->orderBy('wpm', 'desc')
            ->limit(10)
            ->get()
            ->load('user'); // Ensure user relation is loaded

        $leaderboard30 = TypingSession::select('user_id', 'wpm', 'created_at')
            ->where('duration', 30)
            ->whereIn('id', function($query) {
                $query->select(DB::raw('MAX(id)'))
                      ->from('typing_sessions')
                      ->where('duration', 30)
                      ->groupBy('user_id');
            })
            ->orderBy('wpm', 'desc')
            ->limit(10)
            ->get()
            ->load('user'); // Ensure user relation is loaded

        $leaderboard60 = TypingSession::select('user_id', 'wpm', 'created_at')
            ->where('duration', 60)
            ->whereIn('id', function($query) {
                $query->select(DB::raw('MAX(id)'))
                      ->from('typing_sessions')
                      ->where('duration', 60)
                      ->groupBy('user_id');
            })
            ->orderBy('wpm', 'desc')
            ->limit(10)
            ->get()
            ->load('user'); // Ensure user relation is loaded

        $leaderboard120 = TypingSession::select('user_id', 'wpm', 'created_at')
            ->where('duration', 120)
            ->whereIn('id', function($query) {
                $query->select(DB::raw('MAX(id)'))
                      ->from('typing_sessions')
                      ->where('duration', 120)
                      ->groupBy('user_id');
            })
            ->orderBy('wpm', 'desc')
            ->limit(10)
            ->get()
            ->load('user'); // Ensure user relation is loaded

        return response()->view('leaderboard', ['leaderboard15' => $leaderboard15,
        'leaderboard30' => $leaderboard30,
        'leaderboard60' => $leaderboard60,
        'leaderboard120' => $leaderboard120]);

        }

        else{
            return redirect()->route('leaderboard', ['type' => 'daily']);
        }


}

}
