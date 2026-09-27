<?php

use App\Filament\Resources\CurtainStyles\CurtainStyleResource;
use App\Filament\Resources\CurtainStyles\Pages\CreateCurtainStyle;
use App\Models\CurtainStyle;
use App\Models\User;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Livewire\Livewire;

uses(RefreshDatabase::class);

test('the curtains page shows the first eight active styles in dashboard order', function () {
    CurtainStyle::factory()->count(9)->sequence(fn ($sequence) => [
        'name' => 'Style '.($sequence->index + 1),
        'sort_order' => 9 - $sequence->index,
    ])->create();
    CurtainStyle::factory()->inactive()->create(['name' => 'Hidden', 'sort_order' => -1]);

    $this->get(route('curtains'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('curtains/index')
            ->where('styles', fn (Collection $styles) => $styles->pluck('name')->all() === [
                'Style 9', 'Style 8', 'Style 7', 'Style 6', 'Style 5', 'Style 4', 'Style 3', 'Style 2',
            ])
        );
});

test('the styles page lists every active style with its description', function () {
    Storage::fake('public');
    $sheer = CurtainStyle::factory()->create(['name' => 'Sheer curtains', 'description' => 'Soft daylight.', 'sort_order' => 1]);
    $sheer->addMedia(UploadedFile::fake()->image('sheer.jpg', 900, 1200))->toMediaCollection('image');
    CurtainStyle::factory()->count(9)->create(['sort_order' => 2]);
    CurtainStyle::factory()->inactive()->create();

    $this->get(route('curtains.styles'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('curtains/styles')
            ->has('styles', 10)
            ->where('styles.0.name', 'Sheer curtains')
            ->where('styles.0.description', 'Soft daylight.')
            ->where('styles.0.image', fn (string $image) => str_ends_with($image, 'sheer-webp.webp'))
        );
});

test('a curtain style cannot be saved without an image', function () {
    $this->actingAs(User::factory()->create());
    Filament::setCurrentPanel('admin');

    $this->get(CurtainStyleResource::getUrl('index'))->assertSuccessful();

    Livewire::test(CreateCurtainStyle::class)
        ->fillForm(['name' => 'Sheer curtains', 'description' => 'Soft daylight.'])
        ->call('create')
        ->assertHasFormErrors(['image' => 'required']);

    expect(CurtainStyle::query()->count())->toBe(0);
});
