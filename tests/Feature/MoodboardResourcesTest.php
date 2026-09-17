<?php

use App\Enums\LivingEditStep;
use App\Filament\Resources\LivingEditOptions\LivingEditOptionResource;
use App\Filament\Resources\LivingEditOptions\Pages\CreateLivingEditOption;
use App\Filament\Resources\LivingEditOptions\Pages\EditLivingEditOption;
use App\Filament\Resources\LivingEditOptions\Pages\ListLivingEditOptions;
use App\Filament\Resources\LivingSpaces\LivingSpaceResource;
use App\Filament\Resources\LivingSpaces\Pages\CreateLivingSpace;
use App\Filament\Resources\LivingSpaces\Pages\EditLivingSpace;
use App\Filament\Resources\LivingSpaces\Pages\ListLivingSpaces;
use App\Models\LivingEditOption;
use App\Models\LivingSpace;
use App\Models\User;
use Database\Seeders\LivingEditSeeder;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Livewire\Livewire;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->actingAs(User::factory()->create());
    $this->seed(LivingEditSeeder::class);

    Filament::setCurrentPanel('admin');
});

test('space resource pages render', function () {
    $space = LivingSpace::firstOrFail();

    $this->get(LivingSpaceResource::getUrl('index'))->assertSuccessful();
    $this->get(LivingSpaceResource::getUrl('create'))->assertSuccessful();
    $this->get(LivingSpaceResource::getUrl('view', ['record' => $space]))->assertSuccessful();
    $this->get(LivingSpaceResource::getUrl('edit', ['record' => $space]))->assertSuccessful();

    Livewire::test(ListLivingSpaces::class)
        ->assertCanSeeTableRecords(LivingSpace::orderBy('sort_order')->get(), inOrder: true);
});

test('every step has its own option pages', function (LivingEditStep $step) {
    $option = LivingEditOption::where('step', $step)->firstOrFail();
    $parameters = ['record' => $option];

    expect(LivingEditOptionResource::getUrl('index', configuration: $step->key()))->toEndWith("/admin/{$step->key()}-options");

    $this->get(LivingEditOptionResource::getUrl('index', configuration: $step->key()))
        ->assertSuccessful()
        ->assertSee("{$step->getLabel()} Options");
    $this->get(LivingEditOptionResource::getUrl('create', configuration: $step->key()))->assertSuccessful();
    $this->get(LivingEditOptionResource::getUrl('view', $parameters, configuration: $step->key()))->assertSuccessful();
    $this->get(LivingEditOptionResource::getUrl('edit', $parameters, configuration: $step->key()))->assertSuccessful();
})->with(LivingEditStep::cases());

test('the sidebar lists each step on its own and hides the unconfigured options resource', function () {
    $this->get(LivingSpaceResource::getUrl('index'))
        ->assertSuccessful()
        ->assertSeeInOrder(['Spaces', 'Step 1', 'Step 2', 'Step 3', 'Step 4'])
        ->assertDontSee('Living Edit Options');

    $this->get('/admin/living-edit-options')->assertForbidden();
});

test('a step only lists its own options in sort order', function () {
    Filament::setCurrentResourceConfigurationKey(LivingEditStep::Two->key());

    $stepTwoOptions = LivingEditOption::where('step', LivingEditStep::Two)->orderBy('sort_order')->get();

    Livewire::test(ListLivingEditOptions::class)
        ->assertCanSeeTableRecords($stepTwoOptions, inOrder: true)
        ->assertCanNotSeeTableRecords(LivingEditOption::where('step', '!=', LivingEditStep::Two)->get())
        ->assertCountTableRecords($stepTwoOptions->count());
});

test('an option opened from another step is not found', function () {
    $stepOneOption = LivingEditOption::where('step', LivingEditStep::One)->firstOrFail();

    $this->get(LivingEditOptionResource::getUrl('edit', ['record' => $stepOneOption], configuration: LivingEditStep::Three->key()))
        ->assertNotFound();
});

test('an option is created in the step it was created from', function () {
    Filament::setCurrentResourceConfigurationKey(LivingEditStep::Three->key());

    Livewire::test(CreateLivingEditOption::class)
        ->fillForm(['name' => 'Playful'])
        ->call('create')
        ->assertHasNoFormErrors();

    $this->assertDatabaseHas('living_edit_options', ['step' => LivingEditStep::Three, 'name' => 'Playful', 'slug' => 'playful', 'is_active' => true]);
});

test('option names are unique within a step but may repeat across steps', function () {
    Filament::setCurrentResourceConfigurationKey(LivingEditStep::One->key());

    Livewire::test(CreateLivingEditOption::class)
        ->fillForm(['name' => 'Warm'])
        ->call('create')
        ->assertHasFormErrors(['name' => 'unique']);

    Filament::setCurrentResourceConfigurationKey(LivingEditStep::Two->key());

    Livewire::test(CreateLivingEditOption::class)
        ->fillForm(['name' => 'Warm'])
        ->call('create')
        ->assertHasNoFormErrors();

    expect(LivingEditOption::where('step', LivingEditStep::Two)->where('name', 'Warm')->value('slug'))->toBe('warm');
});

test('renaming an option redirects to its new edit url', function () {
    Filament::setCurrentResourceConfigurationKey(LivingEditStep::One->key());
    $option = LivingEditOption::where('step', LivingEditStep::One)->where('slug', 'calm')->firstOrFail();

    Livewire::test(EditLivingEditOption::class, ['record' => $option->getRouteKey()])
        ->fillForm(['name' => 'Serene'])
        ->call('save')
        ->assertHasNoFormErrors()
        ->assertRedirect(LivingEditOptionResource::getUrl('edit', ['record' => 'serene']));
});

test('a space can be created with an icon', function () {
    Storage::fake('public');

    Livewire::test(CreateLivingSpace::class)
        ->fillForm([
            'name' => 'Home office',
            'is_active' => true,
            'icon' => [UploadedFile::fake()->image('icon.png', 64, 64)],
        ])
        ->call('create')
        ->assertHasNoFormErrors();

    $space = LivingSpace::where('slug', 'home-office')->firstOrFail();

    expect($space->getFirstMedia('icon'))->not->toBeNull();
});

test('space names must be unique and present', function () {
    Livewire::test(CreateLivingSpace::class)
        ->fillForm(['name' => 'Kitchen'])
        ->call('create')
        ->assertHasFormErrors(['name' => 'unique']);

    Livewire::test(CreateLivingSpace::class)
        ->fillForm(['name' => ''])
        ->call('create')
        ->assertHasFormErrors(['name' => 'required']);
});

test('renaming a space redirects to its new edit url', function () {
    $space = LivingSpace::where('slug', 'kitchen')->firstOrFail();

    Livewire::test(EditLivingSpace::class, ['record' => $space->getRouteKey()])
        ->fillForm(['name' => 'Open kitchen'])
        ->call('save')
        ->assertHasNoFormErrors()
        ->assertRedirect(LivingSpaceResource::getUrl('edit', ['record' => 'open-kitchen']));
});
