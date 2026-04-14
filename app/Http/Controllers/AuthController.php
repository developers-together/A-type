<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\BuildsFrontendProps;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    use BuildsFrontendProps;

    public function showLogin(Request $request)
    {
        if (Auth::check()) {
            return redirect()->route('profile.show');
        }

        return $this->renderAppPage($request, 'login', [], 'Login');
    }

    public function register(Request $request): JsonResponse|RedirectResponse
    {
        $validated = $request->validate([
            'username' => ['required', 'string', 'min:3', 'max:50', 'unique:users,username'],
            'email' => ['required', 'string', 'email', 'max:100', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'max:255', 'confirmed'],
        ]);

        $user = User::query()->create($validated);

        Auth::login($user);
        $request->session()->regenerate();

        if ($request->expectsJson()) {
            return response()->json([
                'status' => 'success',
                'redirect' => route('profile.show'),
            ], 201);
        }

        return redirect()->route('profile.show');
    }

    public function login(Request $request): JsonResponse|RedirectResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (! Auth::attempt($credentials)) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'The provided credentials do not match our records.',
                ], 422);
            }

            return back()->withErrors([
                'email' => 'The provided credentials do not match our records.',
            ])->onlyInput('email');
        }

        $request->session()->regenerate();

        if ($request->expectsJson()) {
            return response()->json([
                'status' => 'success',
                'redirect' => route('profile.show'),
            ]);
        }

        return redirect()->intended(route('profile.show'));
    }

    public function logout(Request $request): JsonResponse|RedirectResponse
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        if ($request->expectsJson()) {
            return response()->json([
                'status' => 'success',
                'redirect' => route('home'),
            ]);
        }

        return redirect()->route('home');
    }
}
