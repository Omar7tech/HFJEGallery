<?php

use App\Models\LivingFeeling;
use App\Models\LivingSpace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('living edit lists active spaces in order with their active feelings', function () {
    $calm = LivingFeeling::create(['name' => 'Calm', 'sort_order' => 2]);
    $warm = LivingFeeling::create(['name' => 'Warm', 'sort_order' => 1]);
    $hidden = LivingFeeling::create(['name' => 'Hidden', 'sort_order' => 0, 'is_active' => false]);

    LivingSpace::create(['name' => 'Kitchen', 'sort_order' => 2])->feelings()->attach($warm);
    LivingSpace::create(['name' => 'Living room', 'sort_order' => 1])->feelings()->attach([$calm->id, $warm->id, $hidden->id]);
    LivingSpace::create(['name' => 'Garage', 'sort_order' => 0, 'is_active' => false]);

    $this->get(route('living-edit'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('living-edit/index')
            ->has('spaces', 2)
            ->where('spaces.0.id', 'living-room')
            ->where('spaces.0.name', 'Living room')
            ->where('spaces.0.icon', null)
            ->where('spaces.0.feelings', [
                ['id' => 'warm', 'name' => 'Warm', 'icon' => null],
                ['id' => 'calm', 'name' => 'Calm', 'icon' => null],
            ])
            ->where('spaces.1.id', 'kitchen')
            ->has('spaces.1.feelings', 1)
        );
});

test('living edit exposes the webp icon url', function () {
    Storage::fake('public');
    $space = LivingSpace::create(['name' => 'Kitchen']);
    $space->addMedia(UploadedFile::fake()->image('icon.png', 64, 64))->toMediaCollection('icon');

    $this->get(route('living-edit'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('spaces.0.icon', $space->fresh()->getFirstMediaUrl('icon', 'webp'))
            ->etc()
        );
});
