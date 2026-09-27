<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\Sluggable\Attributes\Sluggable;

#[Fillable(['name', 'slug', 'sort_order', 'is_active'])]
#[Sluggable(from: 'name', to: 'slug')]
class LivingSpace extends Model implements HasMedia
{
    use InteractsWithMedia;

    /**
     * Active spaces in their dashboard order, with their icons, as the
     * Living Edit and the home page offer them.
     *
     * @param  Builder<LivingSpace>  $query
     */
    #[Scope]
    protected function offered(Builder $query): void
    {
        $query->where('is_active', true)
            ->orderBy('sort_order')
            ->with('media');
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
        return ['sort_order' => 'integer', 'is_active' => 'boolean'];
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
