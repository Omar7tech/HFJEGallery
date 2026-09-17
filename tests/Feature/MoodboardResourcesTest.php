<?php

use App\Filament\Resources\LivingSpaces\LivingSpaceResource;
use App\Filament\Resources\LivingSpaces\Pages\CreateLivingSpace;
use App\Filament\Resources\LivingSpaces\Pages\EditLivingSpace;
use App\Filament\Resources\LivingSpaces\Pages\ListLivingSpaces;
use App\Filament\Resources\StepOnes\Pages\CreateStepOne;
use App\Filament\Resources\StepOnes\Pages\ListStepOnes;
use App\Filament\Resources\StepOnes\StepOneResource;
use App\Models\LivingSpace;
use App\Models\StepOne;
use App\Models\User;
use Database\Seeders\LivingEditSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Livewire\Livewire;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->actingAs(User::factory()->create());
    $this->seed(LivingEditSeeder::class);
});

test('moodboard resource pages render', function (string $url) {
    $this->get($url)->assertSuccessful();
})->with([
    'spaces index' => fn () => LivingSpaceResource::getUrl('index'),
    'spaces create' => fn () => LivingSpaceResource::getUrl('create'),
    'spaces view' => fn () => LivingSpaceResource::getUrl('view', ['record' => LivingSpace::firstOrFail()]),
    'spaces edit' => fn () => LivingSpaceResource::getUrl('edit', ['record' => LivingSpace::firstOrFail()]),
    'step 1 index' => fn () => StepOneResource::getUrl('index'),
    'step 1 create' => fn () => StepOneResource::getUrl('create'),
    'step 1 view' => fn () => StepOneResource::getUrl('view', ['record' => StepOne::firstOrFail()]),
    'step 1 edit' => fn () => StepOneResource::getUrl('edit', ['record' => StepOne::firstOrFail()]),
]);

test('tables list records in sort order', function () {
    Livewire::test(ListLivingSpaces::class)
        ->assertCanSeeTableRecords(LivingSpace::orderBy('sort_order')->get(), inOrder: true);

    Livewire::test(ListStepOnes::class)
        ->assertCanSeeTableRecords(StepOne::orderBy('sort_order')->get(), inOrder: true);
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

test('a step 1 option can be created', function () {
    Livewire::test(CreateStepOne::class)
        ->fillForm(['name' => 'Playful'])
        ->call('create')
        ->assertHasNoFormErrors();

    $this->assertDatabaseHas('step_ones', ['name' => 'Playful', 'slug' => 'playful', 'is_active' => true]);
});

test('names must be unique and present', function () {
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
