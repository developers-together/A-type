<?php

namespace App\Http\Controllers\Concerns;

use App\Models\User;
use Illuminate\Http\Request;

trait BuildsFrontendProps
{
    protected function renderAppPage(Request $request, string $page, array $data = [], ?string $title = null)
    {
        return view('app', [
            'page' => $page,
            'pageTitle' => $title,
            'props' => [
                'shared' => $this->sharedProps($request),
                'data' => $data,
            ],
        ]);
    }

    protected function sharedProps(Request $request): array
    {
        $user = $request->user();

        return [
            'auth' => $user !== null,
            'theme' => $user?->themePreference?->theme,
            'user' => $user ? $this->serializeUser($user) : null,
            'flash' => [
                'status' => session('status'),
                'error' => session('errors')?->first(),
            ],
        ];
    }

    protected function serializeUser(User $user): array
    {
        $quickNote = $user->profileNotes()
            ->orderByDesc('is_pinned')
            ->orderByDesc('updated_at')
            ->first();

        return [
            'id' => $user->id,
            'username' => $user->username,
            'email' => $user->email,
            'avatarUrl' => $user->avatar_url,
            'quickNote' => $quickNote ? mb_substr($quickNote->body, 0, 96) : null,
            'joinedAt' => $user->created_at?->toDateString(),
        ];
    }
}
