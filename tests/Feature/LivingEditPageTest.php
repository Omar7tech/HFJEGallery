<?php

use App\Models\LivingSpace;
use App\Models\StepOne;
use App\Models\StepTwo;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('living edit lists active spaces, step 1 and step 2 options in order', function () {
    StepOne::create(['name' => 'Calm', 'sort_order' => 2]);
    StepOne::create(['name' => 'Warm', 'sort_order' => 1]);
    StepOne::create(['name' => 'Hidden', 'sort_order' => 0, 'is_active' => false]);

    StepTwo::create(['name' => 'Slow weekends', 'sort_order' => 1]);
    StepTwo::create(['name' => 'Morning coffee', 'sort_order' => 0]);
    StepTwo::create(['name' => 'Hidden', 'sort_order' => 2, 'is_active' => false]);

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
            ->where('stepOne', [
                ['id' => 'warm', 'name' => 'Warm', 'icon' => null],
                ['id' => 'calm', 'name' => 'Calm', 'icon' => null],
            ])
            ->where('stepTwo', [
                ['id' => 'morning-coffee', 'name' => 'Morning coffee', 'icon' => null],
                ['id' => 'slow-weekends', 'name' => 'Slow weekends', 'icon' => null],
            ])
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
