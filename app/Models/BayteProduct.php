<?php

namespace App\Models;

use Database\Factories\BayteProductFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Image\Enums\Fit;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\Sluggable\Attributes\Sluggable;

/**
 * One piece of the BAYTE collection: a name, a line of description and a cutout.
 */
#[Fillable(['bayte_category_id', 'name', 'slug', 'description', 'is_on_home', 'sort_order'])]
#[Sluggable(from: 'name', to: 'slug')]
class BayteProduct extends Model implements HasMedia
{
    /** @use HasFactory<BayteProductFactory> */
    use HasFactory;

    use InteractsWithMedia;

    /** How many pieces the BAYTE section of the home page holds. */
    public const int HOME_LIMIT = 3;

    /** Stand-in cutout shown for any piece without an uploaded image. */
    public const string PLACEHOLDER_IMAGE = 'images/bayte/placeholder.webp';

    /**
     * The cutout shown on the card, falling back to the placeholder.
     */
    public function imageUrl(): string
    {
        return $this->getFirstMediaUrl('image', 'webp')
            ?: asset(self::PLACEHOLDER_IMAGE);
    }

    /**
     * The pieces for the home page: the ones picked in the dashboard, or the
     * first of the collection until any are picked, in dashboard order.
     *
     * @return Collection<int, BayteProduct>
     */
    public static function forHome(): Collection
    {
        $picked = static::query()->where('is_on_home', true)->exists();

        return static::query()
            ->when($picked, fn (Builder $query) => $query->where('is_on_home', true))
            ->with('media')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->limit(self::HOME_LIMIT)
            ->get();
    }

    /** @return BelongsTo<BayteCategory, $this> */
    public function category(): BelongsTo
    {
        return $this->belongsTo(BayteCategory::class, 'bayte_category_id');
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
            ->fit(Fit::Max, 1200, 1200)
            ->format('webp')
            ->quality(75);
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['sort_order' => 'integer', 'is_on_home' => 'boolean'];
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
