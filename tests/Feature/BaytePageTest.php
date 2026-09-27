<?php

use App\Models\BayteCategory;
use App\Models\BayteProduct;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Collection;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('the page opens on the first category', function () {
    $second = BayteCategory::factory()->create(['name' => 'Daybeds', 'sort_order' => 2]);
    $first = BayteCategory::factory()->create(['name' => 'Lounge Chairs', 'sort_order' => 1]);
    BayteProduct::factory()->for($first, 'category')->create(['name' => 'Sannine']);
    BayteProduct::factory()->for($second, 'category')->create(['name' => 'Raouche']);

    $this->get(route('bayte'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('bayte/index')
            ->where('categories', [
                ['slug' => 'lounge-chairs', 'name' => 'Lounge Chairs'],
                ['slug' => 'daybeds', 'name' => 'Daybeds'],
            ])
            ->where('activeCategory', 'lounge-chairs')
            ->where('products.data', fn (Collection $pieces) => $pieces->pluck('name')->all() === ['Sannine'])
            ->where('total', 1)
        );
});

test('a category in the url shows only its own pieces', function () {
    $lounge = BayteCategory::factory()->create(['name' => 'Lounge Chairs', 'sort_order' => 1]);
    $daybeds = BayteCategory::factory()->create(['name' => 'Daybeds', 'sort_order' => 2]);
    BayteProduct::factory()->for($lounge, 'category')->create(['name' => 'Sannine']);
    BayteProduct::factory()->for($daybeds, 'category')->create(['name' => 'Raouche']);

    $this->get(route('bayte', ['category' => 'daybeds']))
        ->assertInertia(fn (Assert $page) => $page
            ->where('activeCategory', 'daybeds')
            ->where('products.data', fn (Collection $pieces) => $pieces->pluck('name')->all() === ['Raouche'])
        );
});

test('an unknown category falls back to the first one', function () {
    $lounge = BayteCategory::factory()->create(['name' => 'Lounge Chairs']);
    BayteProduct::factory()->for($lounge, 'category')->create(['name' => 'Sannine']);

    $this->get(route('bayte', ['category' => 'hammocks']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('activeCategory', 'lounge-chairs')
            ->has('products.data', 1)
        );
});

test('the pieces of a category load nine at a time', function () {
    $category = BayteCategory::factory()->create(['name' => 'Lounge Chairs']);
    BayteProduct::factory()->for($category, 'category')->count(11)->create();

    $this->get(route('bayte'))
        ->assertInertia(fn (Assert $page) => $page
            ->has('products.data', 9)
            ->where('total', 11)
        );

    $this->get(route('bayte', ['page' => 2]))
        ->assertInertia(fn (Assert $page) => $page->has('products.data', 2));
});

test('switching category reloads only the pieces', function () {
    $lounge = BayteCategory::factory()->create(['name' => 'Lounge Chairs', 'sort_order' => 1]);
    $daybeds = BayteCategory::factory()->create(['name' => 'Daybeds', 'sort_order' => 2]);
    BayteProduct::factory()->for($lounge, 'category')->create(['name' => 'Sannine']);
    BayteProduct::factory()->for($daybeds, 'category')->create(['name' => 'Raouche']);

    $this->get(route('bayte', ['category' => 'daybeds']))
        ->assertInertia(fn (Assert $page) => $page
            ->reloadOnly(['products', 'activeCategory', 'total'], fn (Assert $reload) => $reload
                ->where('activeCategory', 'daybeds')
                ->where('products.data.0.name', 'Raouche')
                ->where('total', 1)
                ->missing('categories')
            )
        );
});

test('pieces follow the order set in the dashboard', function () {
    $category = BayteCategory::factory()->create(['name' => 'Lounge Chairs']);
    BayteProduct::factory()->for($category, 'category')->create(['name' => 'Cedra', 'sort_order' => 2]);
    BayteProduct::factory()->for($category, 'category')->create(['name' => 'Sannine', 'sort_order' => 1]);

    $this->get(route('bayte'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('products.data', fn (Collection $pieces) => $pieces->pluck('name')->all() === ['Sannine', 'Cedra'])
        );
});

test('a piece without an upload falls back to the placeholder image', function () {
    $category = BayteCategory::factory()->create(['name' => 'Lounge Chairs']);
    BayteProduct::factory()->for($category, 'category')->create(['name' => 'Sannine']);

    $this->get(route('bayte'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('products.data.0.image', asset(BayteProduct::PLACEHOLDER_IMAGE))
        );
});

test('a category with no pieces is not offered as a filter', function () {
    $lounge = BayteCategory::factory()->create(['name' => 'Lounge Chairs', 'sort_order' => 1]);
    BayteCategory::factory()->create(['name' => 'Lighting', 'sort_order' => 2]);
    BayteProduct::factory()->for($lounge, 'category')->create(['name' => 'Sannine']);

    $this->get(route('bayte'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('categories', [
                ['slug' => 'lounge-chairs', 'name' => 'Lounge Chairs'],
            ])
            ->where('activeCategory', 'lounge-chairs')
        );
});

test('asking for an empty category falls back to one that has pieces', function () {
    $lounge = BayteCategory::factory()->create(['name' => 'Lounge Chairs', 'sort_order' => 1]);
    BayteCategory::factory()->create(['name' => 'Lighting', 'sort_order' => 2]);
    BayteProduct::factory()->for($lounge, 'category')->create(['name' => 'Sannine']);

    $this->get(route('bayte', ['category' => 'lighting']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('activeCategory', 'lounge-chairs')
            ->has('products.data', 1)
        );
});

test('an empty collection renders the page without a category', function () {
    $this->get(route('bayte'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('categories', [])
            ->where('activeCategory', null)
            ->has('products.data', 0)
        );
});
