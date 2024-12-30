<?php

namespace App\Http\Controllers;

use App\Models\TypingSession;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
// use Illuminate\View\View;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

// use Illuminate\Routing\Redirector;

class UserController extends Controller
{
    public function index(){
        if(Auth::check()){

            $highestwpm = TypingSession::where('user_id', Auth::id())
        ->orderBy('wpm')->first();

        $total = TypingSession::where('user_id', Auth::id());
        $totalcount = $total->count();

        $hightestaccuracy = TypingSession::where('user_id', Auth::id())
        ->orderBy('accuracy','desc')->first();

        $duration15 = TypingSession::where('user_id', Auth::id())
        ->where('duration', 15)->orderBy('wpm','desc')->first();

        $duration30 = TypingSession::where('user_id', Auth::id())
        ->where('duration', 30)->orderBy('wpm','desc')->first();

        $duration60 = TypingSession::where('user_id', Auth::id())
        ->where('duration', 60)->orderBy('wpm','desc')->first();

        $duration120 = TypingSession::where('user_id', Auth::id())
        ->where('duration', 120)->orderBy('wpm','desc')->first();

        $wordcount10 = TypingSession::where('user_id', Auth::id())
        ->where('word_count', 10)->orderBy('wpm','desc')->first();

        $wordcount25 = TypingSession::where('user_id', Auth::id())
        ->where('word_count', 25)->orderBy('wpm','desc')->first();

        $wordcount50 = TypingSession::where('user_id', Auth::id())
        ->where('word_count', 50)->orderBy('wpm','desc')->first();

        $wordcount100 = TypingSession::where('user_id', Auth::id())
        ->where('word_count', 100)->orderBy('wpm','desc')->first();

        return view('profile', ['highestwpm' => $highestwpm,
        'totalcount' => $totalcount, 'hightestaccuracy' => $hightestaccuracy,
        'duration15'=>$duration15, 'duration30'=>$duration30,
        'duration60'=>$duration60, 'duration120'=>$duration120,
        'wordcount10'=>$wordcount10,'wordcount25'=>$wordcount25,
        'wordcount50'=>$wordcount50,'wordcount100'=>$wordcount100,
        'username' => Auth::user()->name]);

        }
        else{
            return view('login');
        }
    }

    public function login(Request $request){

        $request->validate(['email'=>'required|email',
        'password'=>'required']);

        $credentials = $request->only('email', 'password');

        if(Auth::attempt($credentials)){
            return view('home');
            //return redirect()->route('profile');//, ['id' => Auth::id()]
        }
    }

    public function register(Request $request){



        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:8',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        Auth::login($user);
        return view('profile');
        //return redirect()->route('profile');//, ['id' => $user->id]
    }

    public function profile(){

    }

    public function logout(Request $request): RedirectResponse
    {
        Auth::logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }

    public function delete(Request $request){

        $user = Auth::user();




        User::where('user_id', $user->id)->delete();


        Auth::logout();

    }


}
