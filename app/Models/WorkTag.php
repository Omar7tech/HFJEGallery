<?php

namespace App\Models;

use Database\Factories\WorkTagFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Spatie\Sluggable\HasSlug;
use Spatie\Sluggable\SlugOptions;

/**
 * A sub-category within a work category (villas, duplexes, rooftops…). A project
 * may carry several, and the category page filters its grid by them.
 */
#[Fillable(['work_category_id', 'name', 'slug', 'sort_order'])]
class WorkTag extends Model
{
    /** @use HasFactory<WorkTagFactory> */
    use HasFactory;

    use HasSlug;

    /** @return BelongsTo<WorkCategory, $this> */
    public function category(): BelongsTo
    {
        return $this->belongsTo(WorkCategory::class, 'work_category_id');
    }

    /** @return BelongsToMany<Project, $this> */
    public function projects(): BelongsToMany
    {
        return $this->belongsToMany(Project::class);
    }

    /**
     * Slugs only need to be unique within their category: two categories may
     * both have a "Modern" tag.
     */
    public function getSlugOptions(): SlugOptions
    {
        return SlugOptions::create()
            ->generateSlugsFrom('name')
            ->saveSlugsTo('slug')
            ->extraScope(fn (Builder $builder): Builder => $builder->where('work_category_id', $this->work_category_id));
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['sort_order' => 'integer'];
    }
}
