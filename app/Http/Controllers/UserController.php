<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
// use Illuminate\View\View;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

// use Illuminate\Routing\Redirector;

class UserController extends Controller
{
    public function index(){
        return view('login');
    }

    public function login(Request $request){

        $request->validate(['email'=>'required|email',
        'password'=>'required']);

        $credentials = $request->only('email', 'password');

        if(Auth::attempt($credentials)){

            return redirect()->route('profile', ['id' => Auth::id()]);
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

        return redirect()->route('profile', ['id' => $user->id]);
    }

    public function profile($id){

        return view('profile');
    }

}
