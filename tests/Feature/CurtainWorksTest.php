<?php

use App\Filament\Resources\CurtainWorks\CurtainWorkResource;
use App\Filament\Resources\CurtainWorks\Pages\CreateCurtainWork;
use App\Models\CurtainWork;
use App\Models\User;
use App\Models\WorkCategory;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Livewire\Livewire;

uses(RefreshDatabase::class);

test('the curtains page previews the first eight works and counts them all', function () {
    CurtainWork::factory()->count(10)->sequence(fn ($sequence) => [
        'name' => 'Work '.($sequence->index + 1),
        'sort_order' => 10 - $sequence->index,
    ])->create();

    $this->get(route('curtains'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('curtains/index')
            ->has('works', 8)
            ->where('works.0.name', 'Work 10')
            ->where('works.0.image', asset(WorkCategory::PLACEHOLDER_IMAGE))
            ->where('worksCount', 10)
        );
});

test('the curtain work portfolio loads nine at a time in dashboard order', function () {
    CurtainWork::factory()->create(['name' => 'Second', 'sort_order' => 2]);
    CurtainWork::factory()->create(['name' => 'First', 'sort_order' => 1]);
    CurtainWork::factory()->count(9)->create(['sort_order' => 3]);

    $this->get(route('curtains.works'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('curtains/works')
            ->has('works.data', 9)
            ->where('works.data', fn (Collection $works) => $works->take(2)->pluck('name')->all() === ['First', 'Second'])
        );

    $this->get(route('curtains.works', ['page' => 2]))
        ->assertInertia(fn (Assert $page) => $page->has('works.data', 2));
});

test('a curtain work opens with its story and gallery', function () {
    Storage::fake('public');
    $work = CurtainWork::factory()->create([
        'name' => 'Achrafieh Sheers',
        'location' => 'Achrafieh',
        'year' => 2025,
        'description' => '<p>Soft <strong>linen</strong><script>alert(1)</script></p>',
    ]);
    $work->addMedia(UploadedFile::fake()->image('living-room.jpg', 1200, 800))->toMediaCollection('gallery');

    $this->get(route('curtains.work', $work))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('curtains/work')
            ->where('work.name', 'Achrafieh Sheers')
            ->where('work.location', 'Achrafieh')
            ->where('work.year', 2025)
            ->where('work.description', '<p>Soft <strong>linen</strong></p>')
            ->has('work.gallery', 1)
            ->where('work.gallery.0.src', fn (string $src) => str_ends_with($src, 'living-room-webp.webp'))
        );
});

test('the next curtain work follows the dashboard order and wraps to the first', function () {
    $first = CurtainWork::factory()->create(['name' => 'First', 'sort_order' => 1]);
    $last = CurtainWork::factory()->create(['name' => 'Last', 'sort_order' => 2]);

    $this->get(route('curtains.work', $first))
        ->assertInertia(fn (Assert $page) => $page->where('nextWork.name', 'Last'));

    $this->get(route('curtains.work', $last))
        ->assertInertia(fn (Assert $page) => $page->where('nextWork.name', 'First'));
});

test('the only curtain work has no next work', function () {
    $work = CurtainWork::factory()->create();

    $this->get(route('curtains.work', $work))
        ->assertInertia(fn (Assert $page) => $page->where('nextWork', null));
});

test('an unknown curtain work is not found', function () {
    $this->get('/curtains/work/hammocks')->assertNotFound();
});

test('curtain works are managed from the dashboard', function () {
    $this->actingAs(User::factory()->create());
    Filament::setCurrentPanel('admin');
    $work = CurtainWork::factory()->create();

    $this->get(CurtainWorkResource::getUrl('index'))->assertSuccessful();
    $this->get(CurtainWorkResource::getUrl('edit', ['record' => $work]))->assertSuccessful();

    Livewire::test(CreateCurtainWork::class)
        ->fillForm(['name' => 'Faqra Chalet Drapes', 'location' => 'Faqra', 'year' => 2024])
        ->call('create')
        ->assertHasNoFormErrors();

    expect(CurtainWork::query()->where('slug', 'faqra-chalet-drapes')->exists())->toBeTrue();
});
