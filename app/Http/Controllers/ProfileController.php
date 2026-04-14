<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\BuildsFrontendProps;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Requests\UpdateThemePreferenceRequest;
use App\Models\TypingSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    use BuildsFrontendProps;

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

        $notes = $user->profileNotes()
            ->orderByDesc('is_pinned')
            ->orderByDesc('updated_at')
            ->get();

        $bestByMode = [
            'time' => [],
            'words' => [],
        ];

        foreach ($bestScores as $score) {
            $bestByMode[$score->mode][(int) $score->amount] = [
                'wpm' => (int) $score->wpm,
                'accuracy' => round((float) $score->accuracy, 2),
            ];
        }

        return $this->renderAppPage($request, 'profile', [
            'stats' => [
                'totalTests' => (int) ($stats->total_tests ?? 0),
                'totalWords' => (int) ($stats->total_words ?? 0),
                'totalTime' => (int) ($stats->total_time ?? 0),
                'avgWpm' => round((float) ($stats->avg_wpm ?? 0)),
                'avgAcc' => round((float) ($stats->avg_acc ?? 0)),
            ],
            'best' => $bestByMode,
            'amounts' => [
                'time' => [15, 30, 60, 120],
                'words' => [10, 25, 50, 100],
            ],
            'notes' => $notes->map(fn ($note) => [
                'id' => $note->id,
                'title' => $note->title,
                'body' => $note->body,
                'isPinned' => (bool) $note->is_pinned,
                'updatedAt' => optional($note->updated_at)->toIso8601String(),
            ])->values(),
        ], 'Profile');
    }

    public function update(UpdateProfileRequest $request): JsonResponse|RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        $user->username = $validated['username'];
        $user->email = $validated['email'];

        if (! empty($validated['password'])) {
            $user->password = $validated['password'];
        }

        $user->save();

        if ($request->expectsJson()) {
            return response()->json([
                'status' => 'success',
                'message' => 'Profile updated successfully.',
                'user' => $this->serializeUser($user),
            ]);
        }

        return redirect()
            ->route('profile.show')
            ->with('status', 'Profile updated successfully.');
    }

    public function updateAvatar(Request $request): JsonResponse|RedirectResponse
    {
        $validated = $request->validate([
            'avatar' => ['required', 'image', 'max:3072', 'mimes:jpg,jpeg,png,webp'],
        ]);

        $user = $request->user();

        if ($user->avatar_path) {
            Storage::disk('public')->delete($user->avatar_path);
        }

        $user->avatar_path = $validated['avatar']->store('avatars/'.$user->id, 'public');
        $user->save();

        if ($request->expectsJson()) {
            return response()->json([
                'status' => 'success',
                'message' => 'Profile picture updated.',
                'avatarUrl' => $user->avatar_url,
                'user' => $this->serializeUser($user),
            ]);
        }

        return redirect()->route('profile.show')->with('status', 'Profile picture updated.');
    }

    public function deleteAvatar(Request $request): JsonResponse|RedirectResponse
    {
        $user = $request->user();

        if ($user->avatar_path) {
            Storage::disk('public')->delete($user->avatar_path);
            $user->avatar_path = null;
            $user->save();
        }

        if ($request->expectsJson()) {
            return response()->json([
                'status' => 'success',
                'message' => 'Profile picture removed.',
                'avatarUrl' => null,
                'user' => $this->serializeUser($user),
            ]);
        }

        return redirect()->route('profile.show')->with('status', 'Profile picture removed.');
    }

    public function clearData(Request $request): JsonResponse|RedirectResponse
    {
        $user = $request->user();

        $user->typingSessions()->delete();
        $user->profileNotes()->delete();
        $user->themePreference()->delete();

        if ($user->avatar_path) {
            Storage::disk('public')->delete($user->avatar_path);
            $user->avatar_path = null;
            $user->save();
        }

        if ($request->expectsJson()) {
            return response()->json([
                'status' => 'success',
                'message' => 'All profile data removed.',
                'user' => $this->serializeUser($user),
            ]);
        }

        return redirect()->route('profile.show')->with('status', 'All profile data removed.');
    }

    public function destroy(Request $request): JsonResponse|RedirectResponse
    {
        $user = $request->user();

        if ($user->avatar_path) {
            Storage::disk('public')->delete($user->avatar_path);
        }

        Auth::logout();
        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        if ($request->expectsJson()) {
            return response()->json([
                'status' => 'success',
                'redirect' => route('home'),
            ]);
        }

        return redirect()->route('home')->with('status', 'Account deleted.');
    }

    public function updateTheme(UpdateThemePreferenceRequest $request): JsonResponse
    {
        $request->user()->themePreference()->updateOrCreate(
            ['user_id' => $request->user()->id],
            ['theme' => $request->validated('theme')]
        );

        return response()->json(['status' => 'success']);
    }
}
