<?php

use App\Models\Project;
use App\Models\WorkCategory;
use App\Models\WorkTag;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('the work page lists categories that have projects in dashboard order', function () {
    $restaurants = WorkCategory::factory()->create(['name' => 'Restaurants', 'sort_order' => 2]);
    $homes = WorkCategory::factory()->create(['name' => 'Homes', 'sort_order' => 1]);
    WorkCategory::factory()->create(['name' => 'Commercial', 'sort_order' => 0]);
    Project::factory()->for($restaurants, 'category')->create();
    Project::factory()->for($homes, 'category')->count(2)->create();

    $this->get(route('work.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('work/index')
            ->where('categories', fn (Collection $categories) => $categories->pluck('slug')->all() === ['homes', 'restaurants'])
            ->where('categories.0.image', asset(WorkCategory::PLACEHOLDER_IMAGE))
        );
});

test('a category shows its own projects in dashboard order', function () {
    $homes = WorkCategory::factory()->create(['name' => 'Homes']);
    $apartments = WorkCategory::factory()->create(['name' => 'Apartments']);
    Project::factory()->for($homes, 'category')->create(['name' => 'Faqra Retreat', 'sort_order' => 2]);
    Project::factory()->for($homes, 'category')->create(['name' => 'Broummana House', 'sort_order' => 1]);
    Project::factory()->for($apartments, 'category')->create(['name' => 'Gemmayze Loft']);

    $this->get(route('work.show', $homes))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('work/show')
            ->where('category.slug', 'homes')
            ->where('projects.data', fn (Collection $projects) => $projects->pluck('name')->all() === ['Broummana House', 'Faqra Retreat'])
            ->where('projects.data.0.image', asset(WorkCategory::PLACEHOLDER_IMAGE))
        );
});

test('the projects of a category load nine at a time', function () {
    $homes = WorkCategory::factory()->create(['name' => 'Homes']);
    Project::factory()->for($homes, 'category')->count(11)->create();

    $this->get(route('work.show', $homes))
        ->assertInertia(fn (Assert $page) => $page->has('projects.data', 9));

    $this->get(route('work.show', ['category' => $homes, 'page' => 2]))
        ->assertInertia(fn (Assert $page) => $page->has('projects.data', 2));
});

test('a tag narrows the category to the projects carrying it', function () {
    $homes = WorkCategory::factory()->create(['name' => 'Homes']);
    $villas = WorkTag::factory()->for($homes, 'category')->create(['name' => 'Villas']);
    $seaside = WorkTag::factory()->for($homes, 'category')->create(['name' => 'Seaside']);
    $batroun = Project::factory()->for($homes, 'category')->create(['name' => 'Batroun Villa', 'sort_order' => 1]);
    $broummana = Project::factory()->for($homes, 'category')->create(['name' => 'Broummana House', 'sort_order' => 2]);
    Project::factory()->for($homes, 'category')->create(['name' => 'Faqra Chalet', 'sort_order' => 3]);
    $batroun->tags()->attach([$villas->id, $seaside->id]);
    $broummana->tags()->attach($villas);

    $this->get(route('work.show', ['category' => $homes, 'tag' => 'villas']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('activeTag', 'villas')
            ->where('projects.data', fn (Collection $projects) => $projects->pluck('name')->all() === ['Batroun Villa', 'Broummana House'])
        );

    $this->get(route('work.show', ['category' => $homes, 'tag' => 'seaside']))
        ->assertInertia(fn (Assert $page) => $page
            ->where('projects.data', fn (Collection $projects) => $projects->pluck('name')->all() === ['Batroun Villa'])
        );

    $this->get(route('work.show', $homes))
        ->assertInertia(fn (Assert $page) => $page
            ->where('activeTag', null)
            ->has('projects.data', 3)
        );
});

test('the category switcher lists only tags that have projects, in dashboard order', function () {
    $homes = WorkCategory::factory()->create(['name' => 'Homes']);
    $seaside = WorkTag::factory()->for($homes, 'category')->create(['name' => 'Seaside', 'sort_order' => 2]);
    $villas = WorkTag::factory()->for($homes, 'category')->create(['name' => 'Villas', 'sort_order' => 1]);
    WorkTag::factory()->for($homes, 'category')->create(['name' => 'Chalets']);
    Project::factory()->for($homes, 'category')->create()->tags()->attach([$seaside->id, $villas->id]);

    $this->get(route('work.show', $homes))
        ->assertInertia(fn (Assert $page) => $page
            ->where('categories.0.tags', [
                ['slug' => 'villas', 'name' => 'Villas', 'count' => 1],
                ['slug' => 'seaside', 'name' => 'Seaside', 'count' => 1],
            ])
        );
});

test('a tag of another category or an unknown tag is not found', function () {
    $homes = WorkCategory::factory()->create(['name' => 'Homes']);
    $apartments = WorkCategory::factory()->create(['name' => 'Apartments']);
    WorkTag::factory()->for($apartments, 'category')->create(['name' => 'Lofts']);
    Project::factory()->for($homes, 'category')->create();

    $this->get(route('work.show', ['category' => $homes, 'tag' => 'lofts']))->assertNotFound();
    $this->get(route('work.show', ['category' => $homes, 'tag' => 'hammocks']))->assertNotFound();
});

test('two categories may share a tag name', function () {
    $homes = WorkCategory::factory()->create(['name' => 'Homes']);
    $apartments = WorkCategory::factory()->create(['name' => 'Apartments']);

    expect(WorkTag::factory()->for($homes, 'category')->create(['name' => 'Modern'])->slug)->toBe('modern')
        ->and(WorkTag::factory()->for($apartments, 'category')->create(['name' => 'Modern'])->slug)->toBe('modern');
});

test('an unknown category is not found', function () {
    $this->get('/work/hammocks')->assertNotFound();
});

test('a project opens under its own category', function () {
    $homes = WorkCategory::factory()->create(['name' => 'Homes']);
    $project = Project::factory()->for($homes, 'category')->create([
        'name' => 'Broummana House',
        'location' => 'Broummana',
        'year' => 2025,
    ]);

    $this->get(route('work.project', [$homes, $project]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('work/project')
            ->where('category.slug', 'homes')
            ->where('project.name', 'Broummana House')
            ->where('project.location', 'Broummana')
            ->where('project.year', 2025)
            ->where('project.cover', asset(WorkCategory::PLACEHOLDER_IMAGE))
            ->where('project.gallery', [])
        );
});

test('a project under another category is not found', function () {
    $homes = WorkCategory::factory()->create(['name' => 'Homes']);
    $restaurants = WorkCategory::factory()->create(['name' => 'Restaurants']);
    $project = Project::factory()->for($homes, 'category')->create();

    $this->get(route('work.project', [$restaurants, $project]))->assertNotFound();
});

test('the next project follows the dashboard order and wraps to the first', function () {
    $homes = WorkCategory::factory()->create(['name' => 'Homes']);
    $first = Project::factory()->for($homes, 'category')->create(['name' => 'Broummana House', 'sort_order' => 1]);
    $last = Project::factory()->for($homes, 'category')->create(['name' => 'Faqra Retreat', 'sort_order' => 2]);

    $this->get(route('work.project', [$homes, $first]))
        ->assertInertia(fn (Assert $page) => $page->where('nextProject.name', 'Faqra Retreat'));

    $this->get(route('work.project', [$homes, $last]))
        ->assertInertia(fn (Assert $page) => $page->where('nextProject.name', 'Broummana House'));
});

test('the only project of a category has no next project', function () {
    $homes = WorkCategory::factory()->create(['name' => 'Homes']);
    $project = Project::factory()->for($homes, 'category')->create();

    $this->get(route('work.project', [$homes, $project]))
        ->assertInertia(fn (Assert $page) => $page->where('nextProject', null));
});

test('the gallery is served as webp in its upload order', function () {
    Storage::fake('public');
    $homes = WorkCategory::factory()->create(['name' => 'Homes']);
    $project = Project::factory()->for($homes, 'category')->create();
    $project->addMedia(UploadedFile::fake()->image('living-room.jpg', 1200, 800))->toMediaCollection('gallery');
    $project->addMedia(UploadedFile::fake()->image('bedroom.jpg', 1200, 800))->toMediaCollection('gallery');

    $this->get(route('work.project', [$homes, $project]))
        ->assertInertia(fn (Assert $page) => $page
            ->has('project.gallery', 2)
            ->where('project.gallery.0.src', fn (string $src) => str_ends_with($src, 'living-room-webp.webp'))
            ->where('project.gallery.0.thumb', fn (string $thumb) => str_ends_with($thumb, 'living-room-thumb.webp'))
            ->where('project.gallery.1.src', fn (string $src) => str_ends_with($src, 'bedroom-webp.webp'))
        );
});

test('the project story keeps its formatting but strips unsafe html', function () {
    $homes = WorkCategory::factory()->create(['name' => 'Homes']);
    $project = Project::factory()->for($homes, 'category')->create([
        'description' => '<p>Tailored <strong>linen</strong><script>alert(1)</script></p><h2 onclick="steal()">The light</h2>',
    ]);

    $this->get(route('work.project', [$homes, $project]))
        ->assertInertia(fn (Assert $page) => $page
            ->where('project.description', '<p>Tailored <strong>linen</strong></p><h2>The light</h2>')
        );
});
