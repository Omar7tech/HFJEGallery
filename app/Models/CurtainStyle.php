<?php

namespace App\Models;

use Database\Factories\CurtainStyleFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Image\Enums\Fit;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\Sluggable\Attributes\Sluggable;

/**
 * A kind of curtain HFJE makes (sheer, blackout, pleated…), shown in the
 * "Designed for Every Window" section and on the curtain styles page.
 */
#[Fillable(['name', 'slug', 'description', 'sort_order', 'is_active'])]
#[Sluggable(from: 'name', to: 'slug')]
class CurtainStyle extends Model implements HasMedia
{
    /** @use HasFactory<CurtainStyleFactory> */
    use HasFactory;

    use InteractsWithMedia;

    /**
     * Active styles in their dashboard order, ties falling back to the order
     * they were added.
     *
     * @param  Builder<CurtainStyle>  $query
     */
    #[Scope]
    protected function shown(Builder $query): void
    {
        $query->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id');
    }

    /**
     * The style photo in the given conversion.
     */
    public function imageUrl(string $conversion = 'webp'): string
    {
        return $this->getFirstMediaUrl('image', $conversion);
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
            ->fit(Fit::Max, 1600, 1600)
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
        return ['sort_order' => 'integer', 'is_active' => 'boolean'];
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
