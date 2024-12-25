<?php

namespace App\Http\Controllers;
use App\Models\TypingSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class HomeController extends Controller
{
    public function index(){
        return view('home');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'wpm' => 'required|numeric',
            'accuracy' => 'required|numeric|min:0|max:100',
            'time_taken' => 'required|integer|min:1',
            'text' => 'required|string',
            'correct_characters' => 'required|integer|min:0',
            'incorrect_characters' => 'required|integer|min:0',
        ]);

        $typingSession = TypingSession::create([
            'user_id' => Auth::id(), // Null if not logged in
            'wpm' => $validated['wpm'],
            'accuracy' => $validated['accuracy'],
            'time_taken' => $validated['time_taken'],
            'text' => $validated['text'],
            'correct_characters' => $validated['correct_characters'],
            'incorrect_characters' => $validated['incorrect_characters'],
        ]);


}
}
