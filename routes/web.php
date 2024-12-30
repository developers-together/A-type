<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\LeaderboardController;

Route::get('/', function () {
    return view('home');
});


Route::post('/', [HomeController::class, 'store'])
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


Route::get('/leaderboard/{type}',
[LeaderboardController::class, 'leaderboard'])->name('leaderboard');

Route::redirect('/leaderboard', '/leaderboard/daily', 301);

Route::post('/logout', [UserController::class, 'logout'])->name('logout');

Route::post('/delete', [UserController::class, 'delete'])->name('delete');

Route::post('/resetdata', [HomeController::class, 'resetdata'])->name('resetdata');
