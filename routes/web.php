<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\HomeController;

Route::get('/', function () {
    return view('home');
});

Route::post('/typing-sessions', [HomeController::class, 'store'])->name('typing-sessions.store')
    ->middleware('auth');


Route::get('/login', [UserController::class, 'index'])->name('login');
Route::post('/login', [UserController::class, 'login'])->name('user.login');


Route::post('/register', [UserController::class, 'register'])->name('user.register');


// Route::get('/profile/{id}', [UserController::class, 'profile'])->name('profile');

Route::get('/profile', function () {
    return view('profile');
});

Route::get('/info', function () {
    return view('info');
});


Route::get('/leaderboard/{type}', function () {
    return view('leaderboard');
});
