<?php

use App\Filament\Resources\Projects\Pages\EditProject;
use App\Filament\Resources\Projects\ProjectResource;
use App\Filament\Resources\WorkCategories\WorkCategoryResource;
use App\Filament\Resources\WorkTags\Pages\CreateWorkTag;
use App\Filament\Resources\WorkTags\Pages\EditWorkTag;
use App\Filament\Resources\WorkTags\WorkTagResource;
use App\Models\Project;
use App\Models\User;
use App\Models\WorkCategory;
use App\Models\WorkTag;
use Filament\Facades\Filament;
use Filament\Forms\Components\CheckboxList;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->actingAs(User::factory()->create());

    Filament::setCurrentPanel('admin');
});

test('category and project pages render with tags', function () {
    $homes = WorkCategory::factory()->create();
    $project = Project::factory()->for($homes, 'category')->create();
    $project->tags()->attach(WorkTag::factory()->for($homes, 'category')->create());

    $this->get(WorkCategoryResource::getUrl('edit', ['record' => $homes]))->assertSuccessful();
    $this->get(ProjectResource::getUrl('index'))->assertSuccessful();
    $this->get(ProjectResource::getUrl('edit', ['record' => $project]))->assertSuccessful();
});

test('tag pages render', function () {
    $tag = WorkTag::factory()->create();

    $this->get(WorkTagResource::getUrl('index'))->assertSuccessful();
    $this->get(WorkTagResource::getUrl('create'))->assertSuccessful();
    $this->get(WorkTagResource::getUrl('edit', ['record' => $tag]))->assertSuccessful();
});

test('a tag is created under a category with the projects picked for it', function () {
    $homes = WorkCategory::factory()->create();
    $project = Project::factory()->for($homes, 'category')->create();

    Livewire::test(CreateWorkTag::class)
        ->fillForm([
            'work_category_id' => $homes->id,
            'name' => 'Villas',
            'projects' => [$project->id],
        ])
        ->call('create')
        ->assertHasNoFormErrors();

    $tag = WorkTag::query()->sole();

    expect($tag->category->is($homes))->toBeTrue()
        ->and($tag->slug)->toBe('villas')
        ->and($tag->projects->modelKeys())->toBe([$project->id]);
});

test('a tag can be renamed and moved to another category', function () {
    $homes = WorkCategory::factory()->create();
    $apartments = WorkCategory::factory()->create();
    $tag = WorkTag::factory()->for($homes, 'category')->create(['name' => 'Villas']);
    $tag->projects()->attach(Project::factory()->for($homes, 'category')->create());

    Livewire::test(EditWorkTag::class, ['record' => $tag->getRouteKey()])
        ->set('data.work_category_id', $apartments->id)
        ->assertSchemaStateSet(['projects' => []])
        ->fillForm(['name' => 'Lofts'])
        ->call('save')
        ->assertHasNoFormErrors();

    $tag->refresh();

    expect($tag->name)->toBe('Lofts')
        ->and($tag->category->is($apartments))->toBeTrue()
        ->and($tag->projects)->toBeEmpty();
});

test('a project moved to another category drops the tags of the old one', function () {
    $homes = WorkCategory::factory()->create();
    $apartments = WorkCategory::factory()->create();
    $project = Project::factory()->for($homes, 'category')->create();
    $project->tags()->attach(WorkTag::factory()->for($homes, 'category')->create());

    Livewire::test(EditProject::class, ['record' => $project->getRouteKey()])
        ->set('data.work_category_id', $apartments->id)
        ->call('save')
        ->assertHasNoFormErrors();

    expect($project->tags()->count())->toBe(0);
});

test('a category cannot have the same tag twice', function () {
    $homes = WorkCategory::factory()->create();
    WorkTag::factory()->for($homes, 'category')->create(['name' => 'Villas']);

    Livewire::test(CreateWorkTag::class)
        ->fillForm(['work_category_id' => $homes->id, 'name' => 'Villas'])
        ->call('create')
        ->assertHasFormErrors(['name' => 'unique']);
});

test('a project saves the tags picked for it', function () {
    $homes = WorkCategory::factory()->create();
    $villas = WorkTag::factory()->for($homes, 'category')->create();
    $seaside = WorkTag::factory()->for($homes, 'category')->create();
    $project = Project::factory()->for($homes, 'category')->create();

    WorkTag::factory()->create(['name' => 'Elsewhere']);

    Livewire::test(EditProject::class, ['record' => $project->getRouteKey()])
        ->assertFormFieldExists('tags', fn (CheckboxList $field): bool => array_keys($field->getOptions()) === [$villas->id, $seaside->id])
        ->fillForm(['tags' => [$villas->id, $seaside->id]])
        ->call('save')
        ->assertHasNoFormErrors();

    expect($project->tags()->pluck('work_tags.id')->sort()->values()->all())->toBe([$villas->id, $seaside->id]);
});
