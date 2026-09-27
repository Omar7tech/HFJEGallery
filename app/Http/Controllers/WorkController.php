<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\WorkCategory;
use Illuminate\Database\Eloquent\Builder;
use Inertia\Inertia;
use Inertia\Response;

class WorkController extends Controller
{
    /** Fills the three-column grid exactly. */
    private const PER_PAGE = 9;

    /**
     * Every category that has projects, as image cards.
     */
    public function index(): Response
    {
        $categories = WorkCategory::query()
            ->has('projects')
            ->with('media')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        return Inertia::render('work/index', [
            'categories' => $categories
                ->map(fn (WorkCategory $category): array => [
                    'slug' => $category->slug,
                    'name' => $category->name,
                    'description' => $category->description,
                    'image' => $category->imageUrl('webp'),
                ])
                ->all(),
        ]);
    }

    /**
     * One category: its cover and its projects, loaded page by page as the visitor scrolls.
     */
    public function show(WorkCategory $category): Response
    {
        $projects = $category->projects()
            ->with('media')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->paginate(self::PER_PAGE)
            ->through(fn (Project $project): array => [
                'slug' => $project->slug,
                'name' => $project->name,
                'location' => $project->location,
                'year' => $project->year,
                'image' => $project->coverUrl(),
            ]);

        return Inertia::render('work/show', [
            'category' => [
                'slug' => $category->slug,
                'name' => $category->name,
                'description' => $category->description,
                'image' => $category->imageUrl('webp'),
            ],
            // The other shelves, so the visitor can hop between categories.
            'categories' => WorkCategory::query()
                ->has('projects')
                ->orderBy('sort_order')
                ->orderBy('id')
                ->get(['slug', 'name'])
                ->map(fn (WorkCategory $item): array => [
                    'slug' => $item->slug,
                    'name' => $item->name,
                ])
                ->all(),
            'projects' => Inertia::scroll($projects),
        ]);
    }

    /**
     * One project: its cover, story and gallery, with the next project of the category.
     */
    public function project(WorkCategory $category, Project $project): Response
    {
        // The project after this one in the dashboard order, wrapping round to
        // the first; a category with a single project has none.
        $next = $category->projects()
            ->with('media')
            ->where(fn (Builder $query) => $query
                ->where('sort_order', '>', $project->sort_order)
                ->orWhere(fn (Builder $query) => $query
                    ->where('sort_order', $project->sort_order)
                    ->where('id', '>', $project->id)))
            ->orderBy('sort_order')
            ->orderBy('id')
            ->first()
            ?? $category->projects()
                ->with('media')
                ->whereKeyNot($project->id)
                ->orderBy('sort_order')
                ->orderBy('id')
                ->first();

        return Inertia::render('work/project', [
            'category' => [
                'slug' => $category->slug,
                'name' => $category->name,
            ],
            'project' => [
                'slug' => $project->slug,
                'name' => $project->name,
                'location' => $project->location,
                'year' => $project->year,
                'summary' => $project->summary,
                'description' => $project->description,
                'cover' => $project->coverUrl('webp'),
                'gallery' => $project->galleryImages(),
            ],
            'nextProject' => $next === null ? null : [
                'slug' => $next->slug,
                'name' => $next->name,
                'image' => $next->coverUrl(),
            ],
        ]);
    }
}
