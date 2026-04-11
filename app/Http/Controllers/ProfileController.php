<?php

namespace App\Http\Controllers;

use App\Models\TypingSession;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        $user = $request->user();

        $allSessions = TypingSession::query()
            ->where('user_id', $user->id)
            ->orderByDesc('wpm')
            ->orderByDesc('accuracy')
            ->orderByDesc('session_at')
            ->get();

        $bestScores = $allSessions
            ->groupBy(fn (TypingSession $session): string => $session->mode . '-' . $session->amount)
            ->map(fn ($group) => $group->first())
            ->values();

        $stats = TypingSession::query()
            ->where('user_id', $user->id)
            ->selectRaw('AVG(accuracy) AS avg_acc')
            ->selectRaw('AVG(wpm) AS avg_wpm')
            ->selectRaw("SUM(CASE WHEN mode = 'words' THEN amount ELSE 0 END) AS total_words")
            ->selectRaw("SUM(CASE WHEN mode = 'time' THEN amount ELSE 0 END) AS total_time")
            ->selectRaw('COUNT(id) AS total_tests')
            ->first();

        return view('profile', [
            'user' => $user,
            'stats' => $bestScores,
            'avg' => $stats,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'username' => ['required', 'string', 'min:3', 'max:50', 'alpha_dash', 'unique:users,username,' . $user->id],
            'email' => ['required', 'email', 'max:100', 'unique:users,email,' . $user->id],
            'password' => ['nullable', 'string', 'min:8', 'max:255', 'confirmed'],
        ]);

        $user->username = $validated['username'];
        $user->email = $validated['email'];

        if (! empty($validated['password'])) {
            $user->password = $validated['password'];
        }

        $user->save();

        return redirect()
            ->route('profile.show')
            ->with('status', 'Profile updated successfully.');
    }

    public function destroy(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
        ]);

        $user = $request->user();

        if (! Hash::check($validated['current_password'], $user->password)) {
            return back()->withErrors([
                'current_password' => 'Current password is incorrect.',
            ]);
        }

        Auth::logout();
        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('home')->with('status', 'Account deleted.');
    }
}
