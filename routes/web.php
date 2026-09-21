<?php

use App\Http\Controllers\LivingEditController;
use App\Http\Controllers\MoodBoardController;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\PreventRequestForgery;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\Support\Facades\Route;
use Illuminate\View\Middleware\ShareErrorsFromSession;

Route::inertia('/', 'home/index')->name('home');
Route::inertia('/about', 'about/index')->name('about');
Route::inertia('/curtains', 'curtains/index')->name('curtains');
Route::get('/living-edit', LivingEditController::class)->name('living-edit');
Route::get('/living-edit/mood-board', MoodBoardController::class)
    ->middleware('throttle:mood-board')
    ->withoutMiddleware([
        // A stateless, read-only JSON endpoint: skip the session and page rendering work.
        EncryptCookies::class,
        AddQueuedCookiesToResponse::class,
        StartSession::class,
        ShareErrorsFromSession::class,
        PreventRequestForgery::class,
        HandleInertiaRequests::class,
        AddLinkHeadersForPreloadedAssets::class,
    ])
    ->name('living-edit.mood-board');
Route::inertia('/contact', 'contact/index')->name('contact');
Route::inertia('/privacy', 'privacy/index')->name('privacy');
Route::inertia('/terms', 'terms/index')->name('terms');
