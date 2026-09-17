<?php

namespace App\Models;

use App\Enums\LivingEditStep;
use Database\Factories\LivingEditOptionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\Sluggable\HasSlug;
use Spatie\Sluggable\SlugOptions;

#[Fillable(['step', 'name', 'slug', 'sort_order', 'is_active'])]
class LivingEditOption extends Model implements HasMedia
{
    /** @use HasFactory<LivingEditOptionFactory> */
    use HasFactory;

    use HasSlug;
    use InteractsWithMedia;

    /**
     * Slugs only need to be unique within the same step.
     */
    public function getSlugOptions(): SlugOptions
    {
        return SlugOptions::create()
            ->generateSlugsFrom('name')
            ->saveSlugsTo('slug')
            ->extraScope(fn (Builder $query): Builder => $query->where('step', $this->step));
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('icon')
            ->singleFile()
            ->useDisk('public');
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('webp')
            ->nonQueued()
            ->format('webp')
            ->quality(75);
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['step' => LivingEditStep::class, 'sort_order' => 'integer', 'is_active' => 'boolean'];
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
