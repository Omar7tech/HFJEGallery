<?php

namespace App\Models;

use Database\Factories\ProjectFactory;
use Filament\Forms\Components\RichEditor\RichContentRenderer;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Spatie\Image\Enums\Fit;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\Sluggable\Attributes\Sluggable;

/**
 * One finished space in the portfolio: a cover, a short story and a gallery.
 */
#[Fillable(['work_category_id', 'name', 'slug', 'location', 'year', 'summary', 'description', 'sort_order'])]
#[Sluggable(from: 'name', to: 'slug')]
class Project extends Model implements HasMedia
{
    /** @use HasFactory<ProjectFactory> */
    use HasFactory;

    use InteractsWithMedia;

    /** @return BelongsTo<WorkCategory, $this> */
    public function category(): BelongsTo
    {
        return $this->belongsTo(WorkCategory::class, 'work_category_id');
    }

    /** @return BelongsToMany<WorkTag, $this> */
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(WorkTag::class);
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

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['year' => 'integer', 'sort_order' => 'integer'];
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
