<?php

use App\Models\LivingFeeling;
use App\Models\LivingSpace;
use Database\Seeders\LivingEditSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

uses(RefreshDatabase::class);

test('living edit seeds can be rerun without duplicates or overwriting edited content', function () {
    $this->seed(LivingEditSeeder::class);
    $space = LivingSpace::where('slug', 'living-room')->firstOrFail();
    $space->update(['name' => 'Lounge']);

    $this->seed(LivingEditSeeder::class);

    $this->assertDatabaseCount('living_spaces', 4);
    $this->assertDatabaseCount('living_feelings', 6);
    $this->assertDatabaseCount('living_feeling_living_space', 24);
    expect($space->fresh()->getAttribute('name'))->toBe('Lounge')
        ->and($space->getAttribute('is_active'))->toBeTrue()
        ->and($space->feelings()->count())->toBe(6);
    expect(LivingFeeling::where('slug', 'warm')->firstOrFail()->spaces()->count())->toBe(4);
});

test('deleting a living space removes its links but preserves shared feelings', function () {
    $this->seed(LivingEditSeeder::class);
    $space = LivingSpace::where('slug', 'kitchen')->firstOrFail();
    $spaceId = $space->getKey();
    $space->delete();

    expect(DB::table('living_feeling_living_space')->where('living_space_id', $spaceId)->count())->toBe(0);
    $this->assertDatabaseCount('living_spaces', 3);
    $this->assertDatabaseCount('living_feelings', 6);
    $this->assertDatabaseCount('living_feeling_living_space', 18);
});
