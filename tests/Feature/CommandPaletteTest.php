<?php

use App\Filament\Resources\BayteProducts\BayteProductResource;
use App\Filament\Support\CommandPalette;
use App\Models\BayteCategory;
use App\Models\BayteProduct;
use App\Models\User;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->actingAs(User::factory()->create());
    Filament::setCurrentPanel('admin');
});

test('the palette offers every page, every new form, the site and the theme', function () {
    $groups = collect(CommandPalette::build()['commands'])->groupBy('group');

    expect($groups->get('Go to')->pluck('label'))->toContain('Dashboard', 'Messages')
        ->and($groups->get('Create')->pluck('label'))->toContain('New project')
        ->and($groups->get('The site')->pluck('label'))->toContain('BAYTÉ')
        ->and($groups->get('Appearance')->pluck('theme')->all())->toBe(['light', 'dark', 'system']);
});

test('records are found by name and open their edit form', function () {
    $category = BayteCategory::factory()->create(['name' => 'Lounge Chairs']);
    $piece = BayteProduct::factory()->for($category, 'category')->create(['name' => 'Sannine']);

    $command = collect(CommandPalette::build()['commands'])->firstWhere('label', 'Sannine');

    expect($command)
        ->group->toBe('BAYTÉ pieces')
        ->hint->toBe('Lounge Chairs')
        ->url->toBe(BayteProductResource::getUrl('edit', ['record' => $piece]))
        ->searchOnly->toBeTrue();
});

test('the palette is on every dashboard page for a signed-in admin', function () {
    $this->get('/admin')
        ->assertOk()
        ->assertSee('Search or jump to')
        ->assertSee('open-command-palette', escape: false);
});

test('the sign-in page has no palette', function () {
    auth()->logout();

    $this->get('/admin/login')
        ->assertOk()
        ->assertDontSee('open-command-palette', escape: false);
});
