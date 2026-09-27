<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\WorkCategory;
use App\Models\WorkTag;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Http\Request;
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
     * One category: its cover and its projects, loaded page by page as the visitor
     * scrolls, optionally narrowed to one of its tags (`?tag=villas`).
     */
    public function show(Request $request, WorkCategory $category): Response
    {
        $tag = $request->filled('tag')
            ? $category->tags()->where('slug', $request->string('tag')->value())->firstOrFail()
            : null;

        $projects = $category->projects()
            ->when($tag, fn (Builder $query, WorkTag $tag) => $query
                ->whereHas('tags', fn (Builder $query) => $query->whereKey($tag->id)))
            ->with(['media', 'tags' => fn (BelongsToMany $query) => $query->orderBy('sort_order')->orderBy('id')])
            ->orderBy('sort_order')
            ->orderBy('id')
            ->paginate(self::PER_PAGE)
            ->withQueryString()
            ->through(fn (Project $project): array => [
                ...$project->toCard(),
                'tags' => $project->tags->pluck('name')->all(),
            ]);

        return Inertia::render('work/show', [
            'category' => [
                'slug' => $category->slug,
                'name' => $category->name,
                'description' => $category->description,
                'image' => $category->imageUrl('webp'),
            ],
            'activeTag' => $tag?->slug,
            // The other shelves with their tags, so the visitor can hop between
            // categories or straight into one of their tags.
            'categories' => WorkCategory::query()
                ->has('projects')
                ->with(['tags' => fn (HasMany $query) => $query->has('projects')])
                ->orderBy('sort_order')
                ->orderBy('id')
                ->get(['id', 'slug', 'name'])
                ->map(fn (WorkCategory $item): array => [
                    'slug' => $item->slug,
                    'name' => $item->name,
                    'tags' => $item->tags
                        ->map(fn (WorkTag $tag): array => [
                            'slug' => $tag->slug,
                            'name' => $tag->name,
                        ])
                        ->all(),
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
        $next = $project->nextAmong($category->projects());

        return Inertia::render('work/project', [
            'category' => [
                'slug' => $category->slug,
                'name' => $category->name,
            ],
            'project' => $project->toDetail(),
            'nextProject' => $next?->toLink(),
        ]);
    }
}
