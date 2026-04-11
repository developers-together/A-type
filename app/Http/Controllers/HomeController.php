<?php

namespace App\Http\Controllers;

use App\Models\TypingSession;
use App\Models\Word;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function index()
    {
        return view('home');
    }

    public function words(Request $request): JsonResponse
    {
        $amount = (int) $request->integer('amount', 15);
        $amount = max(1, min($amount, 200));

        $words = Word::query()
            ->inRandomOrder()
            ->limit($amount)
            ->pluck('word')
            ->map(fn (string $word): array => ['word' => $word])
            ->values();

        return response()->json($words);
    }

    public function typing(Request $request): JsonResponse
    {
        if (! $request->user()) {
            return response()->json([
                'status' => 'error',
                'message' => 'User not logged in',
            ], 401);
        }

        $validated = $request->validate([
            'wpm' => ['required', 'integer', 'min:0', 'max:999'],
            'accuracy' => ['required', 'numeric', 'min:0', 'max:100'],
            'mode' => ['required', 'in:time,words'],
            'amount' => ['required', 'integer', 'min:1', 'max:500'],
            'punctuation' => ['required', 'boolean'],
            'numbers' => ['required', 'boolean'],
        ]);

        TypingSession::query()->create([
            'user_id' => $request->user()->id,
            'wpm' => $validated['wpm'],
            'accuracy' => $validated['accuracy'],
            'mode' => $validated['mode'],
            'amount' => $validated['amount'],
            'punctuation' => (bool) $validated['punctuation'],
            'numbers' => (bool) $validated['numbers'],
            'session_at' => now(),
        ]);

        return response()->json(['status' => 'success']);
    }
}
