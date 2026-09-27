<?php

namespace App\Models;

use Database\Factories\WorkCategoryFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Image\Enums\Fit;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\Sluggable\Attributes\Sluggable;

/**
 * A kind of work HFJE takes on (homes, apartments, restaurants…), shown as an
 * image card on the Work page and opening onto its projects.
 */
#[Fillable(['name', 'slug', 'description', 'sort_order'])]
#[Sluggable(from: 'name', to: 'slug')]
class WorkCategory extends Model implements HasMedia
{
    /** @use HasFactory<WorkCategoryFactory> */
    use HasFactory;

    use InteractsWithMedia;

    /** Stand-in image shown for any category or project without an upload. */
    public const string PLACEHOLDER_IMAGE = 'images/work/placeholder.webp';

    /** @return HasMany<Project, $this> */
    public function projects(): HasMany
    {
        return $this->hasMany(Project::class);
    }

    /** @return HasMany<WorkTag, $this> */
    public function tags(): HasMany
    {
        return $this->hasMany(WorkTag::class)->orderBy('sort_order')->orderBy('id');
    }

    /**
     * The category image in the given conversion, falling back to the placeholder.
     */
    public function imageUrl(string $conversion = 'thumb'): string
    {
        return $this->getFirstMediaUrl('image', $conversion)
            ?: asset(self::PLACEHOLDER_IMAGE);
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('image')
            ->singleFile()
            ->useDisk('public')
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp']);
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('webp')
            ->nonQueued()
            ->fit(Fit::Max, 1920, 1920)
            ->format('webp')
            ->quality(75);

        $this->addMediaConversion('thumb')
            ->nonQueued()
            ->fit(Fit::Max, 800, 800)
            ->format('webp')
            ->quality(70);
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['sort_order' => 'integer'];
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
