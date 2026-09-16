<?php

use App\Http\Controllers\LivingEditController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'home/index')->name('home');
Route::inertia('/about', 'about/index')->name('about');
Route::get('/living-edit', LivingEditController::class)->name('living-edit');
Route::inertia('/contact', 'contact/index')->name('contact');
Route::inertia('/privacy', 'privacy/index')->name('privacy');
Route::inertia('/terms', 'terms/index')->name('terms');
