<?php

use App\Models\LivingSpace;
use App\Models\StepFour;
use App\Models\StepOne;
use App\Models\StepThree;
use App\Models\StepTwo;
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

test('living edit lists the active options of each step in order', function (string $model, string $prop) {
    $model::create(['name' => 'Calm', 'sort_order' => 2]);
    $model::create(['name' => 'Warm', 'sort_order' => 1]);
    $model::create(['name' => 'Hidden', 'sort_order' => 0, 'is_active' => false]);

    $this->get(route('living-edit'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where($prop, [
                ['id' => 'warm', 'name' => 'Warm', 'icon' => null],
                ['id' => 'calm', 'name' => 'Calm', 'icon' => null],
            ])
            ->etc()
        );
})->with([
    'step 1' => [StepOne::class, 'stepOne'],
    'step 2' => [StepTwo::class, 'stepTwo'],
    'step 3' => [StepThree::class, 'stepThree'],
    'step 4' => [StepFour::class, 'stepFour'],
]);

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
