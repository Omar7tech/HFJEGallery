<?php

use App\Filament\Resources\BayteProducts\Pages\EditBayteProduct;
use App\Filament\Resources\BayteProducts\Pages\ListBayteProducts;
use App\Models\BayteCategory;
use App\Models\BayteProduct;
use App\Models\User;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Collection;
use Inertia\Testing\AssertableInertia as Assert;
use Livewire\Livewire;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->category = BayteCategory::factory()->create();
});

test('the home page shows the pieces picked for it in dashboard order', function () {
    BayteProduct::factory()->for($this->category, 'category')->create(['name' => 'Cedra', 'is_on_home' => true, 'sort_order' => 2]);
    BayteProduct::factory()->for($this->category, 'category')->create(['name' => 'Sannine', 'is_on_home' => true, 'sort_order' => 1]);
    BayteProduct::factory()->for($this->category, 'category')->create(['name' => 'Raouche', 'sort_order' => 0]);

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('home/index')
            ->where('bayteProducts', fn (Collection $products) => $products->pluck('name')->all() === ['Sannine', 'Cedra'])
            ->where('bayteProducts.0.image', asset(BayteProduct::PLACEHOLDER_IMAGE))
        );
});

test('until any are picked the home page shows the first three pieces', function () {
    BayteProduct::factory()->for($this->category, 'category')->count(5)->sequence(fn ($sequence) => [
        'name' => 'Piece '.$sequence->index,
        'sort_order' => $sequence->index,
    ])->create();

    $this->get(route('home'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('bayteProducts', fn (Collection $products) => $products->pluck('name')->all() === ['Piece 0', 'Piece 1', 'Piece 2'])
        );
});

test('a fourth piece cannot be put on the home page', function () {
    $this->actingAs(User::factory()->create());
    Filament::setCurrentPanel('admin');
    BayteProduct::factory()->for($this->category, 'category')->count(3)->create(['is_on_home' => true]);
    $fourth = BayteProduct::factory()->for($this->category, 'category')->create();

    Livewire::test(EditBayteProduct::class, ['record' => $fourth->getRouteKey()])
        ->fillForm(['is_on_home' => true])
        ->call('save')
        ->assertHasFormErrors(['is_on_home']);

    expect($fourth->refresh()->is_on_home)->toBeFalse();
});

test('a piece already on the home page can still be saved', function () {
    $this->actingAs(User::factory()->create());
    Filament::setCurrentPanel('admin');
    $pieces = BayteProduct::factory()->for($this->category, 'category')->count(3)->create(['is_on_home' => true]);

    Livewire::test(EditBayteProduct::class, ['record' => $pieces->first()->getRouteKey()])
        ->fillForm(['name' => 'Renamed'])
        ->call('save')
        ->assertHasNoFormErrors();

    $this->get(ListBayteProducts::getUrl())->assertSuccessful();
});
