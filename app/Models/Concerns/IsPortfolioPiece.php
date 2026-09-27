<?php

namespace App\Models\Concerns;

use App\Models\WorkCategory;
use Filament\Forms\Components\RichEditor\RichContentRenderer;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\Relation;
use Spatie\Image\Enums\Fit;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * A finished piece of the portfolio (a work project, a curtain work): a cover,
 * a rich-text story and an ordered gallery, reached by its slug. Everything the
 * site shows of it, card and page alike, is shaped here once.
 *
 * @property string $slug
 * @property string $name
 * @property string|null $location
 * @property int|null $year
 * @property string|null $summary
 * @property string|null $description
 * @property int $sort_order
 */
trait IsPortfolioPiece
{
    use InteractsWithMedia;

    public function initializeIsPortfolioPiece(): void
    {
        $this->mergeCasts(['year' => 'integer', 'sort_order' => 'integer']);
    }

    /**
     * The cover in the given conversion, falling back to the placeholder.
     */
    public function coverUrl(string $conversion = 'thumb'): string
    {
        return $this->getFirstMediaUrl('cover', $conversion)
            ?: asset(WorkCategory::PLACEHOLDER_IMAGE);
    }

    /**
     * The rich-text story as sanitized HTML, safe to render on the site.
     */
    public function descriptionHtml(): ?string
    {
        if (blank($this->description)) {
            return null;
        }

        return RichContentRenderer::make($this->description)->toHtml();
    }

    /**
     * The gallery in its dashboard order: a full-size image and a grid thumbnail each.
     *
     * @return list<array{src: string, thumb: string}>
     */
    public function galleryImages(): array
    {
        return array_values($this->getMedia('gallery')
            ->map(fn (Media $media): array => [
                'src' => $media->getUrl('webp'),
                'thumb' => $media->getUrl('thumb'),
            ])
            ->all());
    }

    /**
     * The piece as a card in a grid.
     *
     * @return array{slug: string, name: string, location: string|null, year: int|null, image: string}
     */
    public function toCard(): array
    {
        return [
            'slug' => $this->slug,
            'name' => $this->name,
            'location' => $this->location,
            'year' => $this->year,
            'image' => $this->coverUrl(),
        ];
    }

    /**
     * The piece with everything its own page shows.
     *
     * @return array{slug: string, name: string, location: string|null, year: int|null, summary: string|null, description: string|null, cover: string, gallery: list<array{src: string, thumb: string}>}
     */
    public function toDetail(): array
    {
        return [
            'slug' => $this->slug,
            'name' => $this->name,
            'location' => $this->location,
            'year' => $this->year,
            'summary' => $this->summary,
            'description' => $this->descriptionHtml(),
            'cover' => $this->coverUrl('webp'),
            'gallery' => $this->galleryImages(),
        ];
    }

    /**
     * The piece as the "next project" link at the foot of another's page.
     *
     * @return array{slug: string, name: string, image: string}
     */
    public function toLink(): array
    {
        return [
            'slug' => $this->slug,
            'name' => $this->name,
            'image' => $this->coverUrl(),
        ];
    }

    /**
     * The piece after this one among its siblings in the dashboard order,
     * wrapping round to the first; a piece without siblings has none.
     *
     * @param  Builder<static>|Relation<static, *, *>  $siblings
     */
    public function nextAmong(Builder|Relation $siblings): ?static
    {
        return (clone $siblings)
            ->with('media')
            ->where(fn (Builder $query) => $query
                ->where('sort_order', '>', $this->sort_order)
                ->orWhere(fn (Builder $query) => $query
                    ->where('sort_order', $this->sort_order)
                    ->where($this->getKeyName(), '>', $this->getKey())))
            ->orderBy('sort_order')
            ->orderBy($this->getKeyName())
            ->first()
            ?? (clone $siblings)
                ->with('media')
                ->whereKeyNot($this->getKey())
                ->orderBy('sort_order')
                ->orderBy($this->getKeyName())
                ->first();
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('cover')
            ->singleFile()
            ->useDisk('public')
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp']);

        $this->addMediaCollection('gallery')
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

    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
