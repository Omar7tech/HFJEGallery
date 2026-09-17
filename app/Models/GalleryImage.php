<?php

namespace App\Models;

use App\Enums\LivingEditStep;
use App\Enums\MoodBoardImageSlot;
use Database\Factories\GalleryImageFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Spatie\Image\Enums\Fit;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * A mood board image, matched to visitors by space, slot and the options they pick in each step.
 *
 * @property MoodBoardImageSlot $slot
 */
#[Fillable(['slot', 'alt_text', 'is_active'])]
class GalleryImage extends Model implements HasMedia
{
    /** @use HasFactory<GalleryImageFactory> */
    use HasFactory;

    use InteractsWithMedia;

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
            ->fit(Fit::Max, 480, 480)
            ->format('webp')
            ->quality(70);
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['slot' => MoodBoardImageSlot::class, 'is_active' => 'boolean'];
    }

    /** @return BelongsToMany<LivingSpace, $this> */
    public function spaces(): BelongsToMany
    {
        return $this->belongsToMany(LivingSpace::class);
    }

    /** @return BelongsToMany<LivingEditOption, $this> */
    public function options(): BelongsToMany
    {
        return $this->belongsToMany(LivingEditOption::class);
    }

    /**
     * Replaces the linked options of one step, leaving the other steps untouched.
     *
     * @param  array<int|string>  $optionIds
     */
    public function syncStepOptions(LivingEditStep $step, array $optionIds): void
    {
        $stepOptionIds = LivingEditOption::query()->where('step', $step)->pluck('id');
        $selectedIds = $stepOptionIds->intersect(array_map(intval(...), $optionIds));

        $this->options()->detach($stepOptionIds->diff($selectedIds)->all());
        $this->options()->syncWithoutDetaching($selectedIds->all());
    }
}
