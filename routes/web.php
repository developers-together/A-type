<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\InfoController;
use App\Http\Controllers\LeaderboardController;
use App\Http\Controllers\ProfileNoteController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/home', [HomeController::class, 'index']);
Route::get('/home/words', [HomeController::class, 'words'])->name('home.words');
Route::post('/home/typing', [HomeController::class, 'typing'])->name('home.typing');

Route::get('/info', [InfoController::class, 'index'])->name('info');
Route::get('/leaderboard', [LeaderboardController::class, 'index'])->name('leaderboard');

Route::middleware('guest')->group(function (): void {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/auth/login', [AuthController::class, 'login'])->name('auth.login');
    Route::post('/auth/register', [AuthController::class, 'register'])->name('auth.register');
    Route::post('/Profile/login', [AuthController::class, 'login']);
    Route::post('/Profile/register', [AuthController::class, 'register']);
});

Route::middleware('auth')->group(function (): void {
    Route::get('/profile', [ProfileController::class, 'show'])->name('profile.show');
    Route::put('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::put('/profile/theme', [ProfileController::class, 'updateTheme'])->name('profile.theme.update');
    Route::get('/profile/notes', [ProfileNoteController::class, 'index'])->name('profile.notes.index');
    Route::post('/profile/notes', [ProfileNoteController::class, 'store'])->name('profile.notes.store');
    Route::get('/profile/notes/{profileNote}', [ProfileNoteController::class, 'show'])->name('profile.notes.show');
    Route::put('/profile/notes/{profileNote}', [ProfileNoteController::class, 'update'])->name('profile.notes.update');
    Route::delete('/profile/notes/{profileNote}', [ProfileNoteController::class, 'destroy'])->name('profile.notes.destroy');
    Route::post('/auth/logout', [AuthController::class, 'logout'])->name('auth.logout');
    Route::post('/Profile/logout', [AuthController::class, 'logout']);
});

// Legacy path compatibility
Route::redirect('/Home', '/home', 301);
Route::redirect('/Info', '/info', 301);
Route::redirect('/Leaderboard', '/leaderboard', 301);
Route::redirect('/Profile', '/profile', 301);
