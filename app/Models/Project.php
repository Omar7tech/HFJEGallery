<?php

namespace App\Models;

use App\Models\Concerns\IsPortfolioPiece;
use Database\Factories\ProjectFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Spatie\MediaLibrary\HasMedia;
use Spatie\Sluggable\Attributes\Sluggable;

/**
 * One finished space in the portfolio: a cover, a short story and a gallery,
 * filed under a work category and its tags.
 */
#[Fillable(['work_category_id', 'name', 'slug', 'location', 'year', 'summary', 'description', 'sort_order'])]
#[Sluggable(from: 'name', to: 'slug')]
class Project extends Model implements HasMedia
{
    /** @use HasFactory<ProjectFactory> */
    use HasFactory;

    use IsPortfolioPiece;

    /** @return BelongsTo<WorkCategory, $this> */
    public function category(): BelongsTo
    {
        return $this->belongsTo(WorkCategory::class, 'work_category_id');
    }

    /**
     * The tags the project carries, in their dashboard order.
     *
     * @return BelongsToMany<WorkTag, $this>
     */
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(WorkTag::class)
            ->orderBy('sort_order')
            ->orderBy('work_tags.id');
    }

    /**
     * A project only carries tags of its own category: moving it to another
     * category drops the tags of the old one.
     */
    protected static function booted(): void
    {
        static::updated(function (Project $project): void {
            if ($project->wasChanged('work_category_id')) {
                $project->tags()->detach(
                    $project->tags()->whereNot('work_category_id', $project->work_category_id)->pluck('work_tags.id'),
                );
            }
        });
    }
}
