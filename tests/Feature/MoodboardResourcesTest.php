<?php

use App\Filament\Resources\LivingSpaces\LivingSpaceResource;
use App\Filament\Resources\LivingSpaces\Pages\CreateLivingSpace;
use App\Filament\Resources\LivingSpaces\Pages\EditLivingSpace;
use App\Filament\Resources\LivingSpaces\Pages\ListLivingSpaces;
use App\Filament\Resources\StepFours\Pages\CreateStepFour;
use App\Filament\Resources\StepFours\Pages\ListStepFours;
use App\Filament\Resources\StepFours\StepFourResource;
use App\Filament\Resources\StepOnes\Pages\CreateStepOne;
use App\Filament\Resources\StepOnes\Pages\ListStepOnes;
use App\Filament\Resources\StepOnes\StepOneResource;
use App\Filament\Resources\StepThrees\Pages\CreateStepThree;
use App\Filament\Resources\StepThrees\Pages\ListStepThrees;
use App\Filament\Resources\StepThrees\StepThreeResource;
use App\Filament\Resources\StepTwos\Pages\CreateStepTwo;
use App\Filament\Resources\StepTwos\Pages\ListStepTwos;
use App\Filament\Resources\StepTwos\StepTwoResource;
use App\Models\LivingSpace;
use App\Models\StepFour;
use App\Models\StepOne;
use App\Models\StepThree;
use App\Models\StepTwo;
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

dataset('moodboard resources', [
    'spaces' => [LivingSpaceResource::class, LivingSpace::class, ListLivingSpaces::class],
    'step 1' => [StepOneResource::class, StepOne::class, ListStepOnes::class],
    'step 2' => [StepTwoResource::class, StepTwo::class, ListStepTwos::class],
    'step 3' => [StepThreeResource::class, StepThree::class, ListStepThrees::class],
    'step 4' => [StepFourResource::class, StepFour::class, ListStepFours::class],
]);

test('moodboard resource pages render', function (string $resource, string $model) {
    $record = $model::firstOrFail();

    $this->get($resource::getUrl('index'))->assertSuccessful();
    $this->get($resource::getUrl('create'))->assertSuccessful();
    $this->get($resource::getUrl('view', ['record' => $record]))->assertSuccessful();
    $this->get($resource::getUrl('edit', ['record' => $record]))->assertSuccessful();
})->with('moodboard resources');

test('tables list records in sort order', function (string $resource, string $model, string $listPage) {
    Livewire::test($listPage)
        ->assertCanSeeTableRecords($model::orderBy('sort_order')->get(), inOrder: true);
})->with('moodboard resources');

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

test('a step option can be created', function (string $createPage, string $table) {
    Livewire::test($createPage)
        ->fillForm(['name' => 'Playful'])
        ->call('create')
        ->assertHasNoFormErrors();

    $this->assertDatabaseHas($table, ['name' => 'Playful', 'slug' => 'playful', 'is_active' => true]);
})->with([
    'step 1' => [CreateStepOne::class, 'step_ones'],
    'step 2' => [CreateStepTwo::class, 'step_twos'],
    'step 3' => [CreateStepThree::class, 'step_threes'],
    'step 4' => [CreateStepFour::class, 'step_fours'],
]);

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
