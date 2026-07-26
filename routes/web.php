<?php

use Illuminate\Support\Facades\Route;

Route::inertia('/', 'home/index')->name('home');
Route::inertia('/contact', 'contact/index')->name('contact');
