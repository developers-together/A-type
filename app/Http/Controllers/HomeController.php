<?php

namespace App\Http\Controllers;

use App\Models\TypingSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class HomeController extends Controller
{
    public function index()
    {
        return view('home');
    }

    public function store(Request $request)
    {
        Log::info('Store method called', ['request' => $request->all()]);

        // Ensure the user is authenticated
        if (!Auth::check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $x = Auth::id(); // Get the authenticated user's ID
        Log::info('User ID:', ['id' => $x]);

        // Validate the request data
        $validated = $request->validate([
            'wpm' => 'required|integer',
            'accuracy' => 'required|integer|min:0|max:100',
            'time_taken' => 'required|integer|min:1',
            'mode' => 'required|boolean', // mode is a boolean now
            'duration' => 'nullable|integer|in:15,30,60,120', // Required if mode is true (timer mode)
            'word_count' => 'nullable|integer|in:10,25,50,100', // Required if mode is false (word_count mode)
            'include_numbers' => 'required|boolean',
            'include_punctuation' => 'required|boolean',
        ]);

        Log::info('validated', $validated);

        // Adjust the 'mode' value, as it is now boolean
        if ($validated['mode']) {
            // Mode is true, so we are using timer mode
            $validated['word_count'] = null;
        } else {
            // Mode is false, so we are using word count mode
            $validated['duration'] = null;
        }

        // Create the typing session record
        $typingSession = TypingSession::create([
            'user_id' => $x,
            'wpm' => $validated['wpm'],
            'accuracy' => $validated['accuracy'],
            'time_taken' => $validated['time_taken'],
            'mode' => $validated['mode'], // Boolean mode value
            'duration' => $validated['duration'], // Nullable, only set if mode is true
            'word_count' => $validated['word_count'], // Nullable, only set if mode is false
            'include_numbers' => $validated['include_numbers'], // Boolean value for numbers
            'include_punctuation' => $validated['include_punctuation'], // Boolean value for punctuation
        ]);

        Log::info('database', $typingSession->toArray());

        // Return a success response with the created session data
        return response()->json(['message' => 'Typing session saved successfully', 'data' => $typingSession], 201);
    }

    public function resetdata(Request $request)
    {
        $user = Auth::user();

        TypingSession::where('user_id', $user->id)->delete();
    }
}
