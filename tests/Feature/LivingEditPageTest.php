<?php

use App\Enums\LivingEditStep;
use App\Models\LivingEditOption;
use App\Models\LivingSpace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('living edit lists active spaces in order', function () {
    LivingSpace::create(['name' => 'Kitchen', 'sort_order' => 2]);
    LivingSpace::create(['name' => 'Living room', 'sort_order' => 1]);
    LivingSpace::create(['name' => 'Garage', 'sort_order' => 0, 'is_active' => false]);

    $this->get(route('living-edit'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('living-edit/index')
            ->where('spaces', [
                ['id' => 'living-room', 'name' => 'Living room', 'icon' => null],
                ['id' => 'kitchen', 'name' => 'Kitchen', 'icon' => null],
            ])
            ->etc()
        );
});

test('living edit groups the active options of each step in order', function () {
    LivingEditOption::factory()->step(LivingEditStep::Two)->create(['name' => 'Calm', 'sort_order' => 2]);
    LivingEditOption::factory()->step(LivingEditStep::Two)->create(['name' => 'Warm', 'sort_order' => 1]);
    LivingEditOption::factory()->step(LivingEditStep::Two)->inactive()->create(['name' => 'Hidden', 'sort_order' => 0]);
    LivingEditOption::factory()->step(LivingEditStep::Four)->create(['name' => 'Earthy']);

    $this->get(route('living-edit'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('steps', [
                'step-1' => [],
                'step-2' => [
                    ['id' => 'warm', 'name' => 'Warm', 'icon' => null],
                    ['id' => 'calm', 'name' => 'Calm', 'icon' => null],
                ],
                'step-3' => [],
                'step-4' => [
                    ['id' => 'earthy', 'name' => 'Earthy', 'icon' => null],
                ],
            ])
            ->etc()
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
