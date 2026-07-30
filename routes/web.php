<?php

use Illuminate\Support\Facades\Route;

Route::inertia('/', 'home/index')->name('home');
Route::inertia('/contact', 'contact/index')->name('contact');
Route::inertia('/privacy', 'privacy/index')->name('privacy');
Route::inertia('/terms', 'terms/index')->name('terms');
