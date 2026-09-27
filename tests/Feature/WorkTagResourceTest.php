<?php

use App\Filament\Resources\Projects\Pages\EditProject;
use App\Filament\Resources\Projects\ProjectResource;
use App\Filament\Resources\WorkCategories\Pages\EditWorkCategory;
use App\Filament\Resources\WorkCategories\WorkCategoryResource;
use App\Models\Project;
use App\Models\User;
use App\Models\WorkCategory;
use App\Models\WorkTag;
use Filament\Facades\Filament;
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

test('a category saves its tags in the order they are listed', function () {
    $homes = WorkCategory::factory()->create(['name' => 'Homes']);

    Livewire::test(EditWorkCategory::class, ['record' => $homes->getRouteKey()])
        ->set('data.tags', [
            ['name' => 'Villas'],
            ['name' => 'Seaside'],
        ])
        ->call('save')
        ->assertHasNoFormErrors();

    expect($homes->tags()->pluck('name')->all())->toBe(['Villas', 'Seaside']);
});

test('a project saves the tags picked for it', function () {
    $homes = WorkCategory::factory()->create();
    $villas = WorkTag::factory()->for($homes, 'category')->create();
    $seaside = WorkTag::factory()->for($homes, 'category')->create();
    $project = Project::factory()->for($homes, 'category')->create();

    Livewire::test(EditProject::class, ['record' => $project->getRouteKey()])
        ->fillForm(['tags' => [$villas->id, $seaside->id]])
        ->call('save')
        ->assertHasNoFormErrors();

    expect($project->tags()->pluck('work_tags.id')->sort()->values()->all())->toBe([$villas->id, $seaside->id]);
});
