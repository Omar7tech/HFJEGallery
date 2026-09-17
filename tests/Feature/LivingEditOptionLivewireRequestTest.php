<?php

use App\Enums\LivingEditStep;
use App\Filament\LivingEdit\Resources\LivingEditOptions\LivingEditOptionResource;
use App\Filament\LivingEdit\Resources\LivingEditOptions\Pages\ListLivingEditOptions;
use App\Models\LivingEditOption;
use App\Models\User;
use Database\Seeders\LivingEditSeeder;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->actingAs(User::factory()->create());
    $this->seed(LivingEditSeeder::class);

    Filament::setCurrentPanel('admin');
});

/**
 * Sends a real Livewire update request for the options table rendered on a step's list page,
 * the same way the browser does after the page has loaded.
 */
function callStepTableMethod(LivingEditStep $step, string $method, array $params): void
{
    $html = test()->get(LivingEditOptionResource::getUrl('index', configuration: $step->key()))
        ->assertSuccessful()
        ->getContent();

    preg_match_all('/wire:snapshot="([^"]+)"/', $html, $matches);

    $snapshot = collect($matches[1])
        ->map(fn (string $encoded): string => html_entity_decode($encoded, ENT_QUOTES))
        ->first(fn (string $snapshot): bool => json_decode($snapshot, true)['memo']['name'] === ListLivingEditOptions::class);

    expect($snapshot)->not->toBeNull();

    Filament::setCurrentResourceConfigurationKey(null);

    test()->withHeader('X-Livewire', 'true')
        ->postJson(Livewire::getUpdateUri(), [
            'components' => [[
                'snapshot' => $snapshot,
                'updates' => [],
                'calls' => [['path' => '', 'method' => $method, 'params' => $params]],
            ]],
        ])
        ->assertSuccessful();
}

test('livewire requests on a step page keep acting on that step', function () {
    $stepTwoOption = LivingEditOption::where('step', LivingEditStep::Two)->firstOrFail();

    callStepTableMethod(LivingEditStep::Two, 'updateTableColumnState', ['is_active', (string) $stepTwoOption->getKey(), false]);

    expect($stepTwoOption->fresh()->is_active)->toBeFalse();
});

test('livewire requests on a step page cannot change another step', function () {
    $stepOneOption = LivingEditOption::where('step', LivingEditStep::One)->firstOrFail();

    callStepTableMethod(LivingEditStep::Two, 'updateTableColumnState', ['is_active', (string) $stepOneOption->getKey(), false]);

    expect($stepOneOption->fresh()->is_active)->toBeTrue();
});
