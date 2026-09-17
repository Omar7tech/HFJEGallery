<?php

use App\Models\LivingSpace;
use Database\Seeders\LivingEditSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('living edit seeds can be rerun without duplicates or overwriting edited content', function () {
    $this->seed(LivingEditSeeder::class);
    $space = LivingSpace::where('slug', 'living-room')->firstOrFail();
    $space->update(['name' => 'Lounge']);

    $this->seed(LivingEditSeeder::class);

    $this->assertDatabaseCount('living_spaces', 4);
    $this->assertDatabaseCount('step_ones', 6);
    $this->assertDatabaseCount('step_twos', 6);
    $this->assertDatabaseCount('step_threes', 6);
    $this->assertDatabaseCount('step_fours', 6);
    expect($space->fresh()->getAttribute('name'))->toBe('Lounge')
        ->and($space->getAttribute('is_active'))->toBeTrue();
});
