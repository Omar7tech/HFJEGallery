<?php

use App\Filament\Resources\LivingFeelings\LivingFeelingResource;
use App\Filament\Resources\LivingFeelings\Pages\CreateLivingFeeling;
use App\Filament\Resources\LivingFeelings\Pages\ListLivingFeelings;
use App\Filament\Resources\LivingSpaces\LivingSpaceResource;
use App\Filament\Resources\LivingSpaces\Pages\CreateLivingSpace;
use App\Filament\Resources\LivingSpaces\Pages\EditLivingSpace;
use App\Filament\Resources\LivingSpaces\Pages\ListLivingSpaces;
use App\Models\LivingFeeling;
use App\Models\LivingSpace;
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
    'feelings index' => fn () => LivingFeelingResource::getUrl('index'),
    'feelings create' => fn () => LivingFeelingResource::getUrl('create'),
    'feelings view' => fn () => LivingFeelingResource::getUrl('view', ['record' => LivingFeeling::firstOrFail()]),
    'feelings edit' => fn () => LivingFeelingResource::getUrl('edit', ['record' => LivingFeeling::firstOrFail()]),
]);

test('tables list records in sort order', function () {
    Livewire::test(ListLivingSpaces::class)
        ->assertCanSeeTableRecords(LivingSpace::orderBy('sort_order')->get(), inOrder: true);

    Livewire::test(ListLivingFeelings::class)
        ->assertCanSeeTableRecords(LivingFeeling::orderBy('sort_order')->get(), inOrder: true);
});

test('a space can be created with feelings, image and icon', function () {
    Storage::fake('public');
    $feelingIds = LivingFeeling::orderBy('id')->limit(2)->pluck('id')->all();

    Livewire::test(CreateLivingSpace::class)
        ->fillForm([
            'name' => 'Home office',
            'is_active' => true,
            'feelings' => $feelingIds,
            'image' => [UploadedFile::fake()->image('cover.jpg', 800, 600)],
            'icon' => [UploadedFile::fake()->image('icon.png', 64, 64)],
        ])
        ->call('create')
        ->assertHasNoFormErrors();

    $space = LivingSpace::where('slug', 'home-office')->firstOrFail();

    expect($space->feelings()->pluck('living_feelings.id')->sort()->values()->all())->toBe($feelingIds)
        ->and($space->getFirstMedia('image'))->not->toBeNull()
        ->and($space->getFirstMedia('icon'))->not->toBeNull();
});

test('a feeling can be created and linked to spaces', function () {
    $spaceIds = LivingSpace::pluck('id')->all();

    Livewire::test(CreateLivingFeeling::class)
        ->fillForm([
            'name' => 'Playful',
            'spaces' => $spaceIds,
        ])
        ->call('create')
        ->assertHasNoFormErrors();

    expect(LivingFeeling::where('slug', 'playful')->firstOrFail()->spaces()->count())->toBe(count($spaceIds));
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
