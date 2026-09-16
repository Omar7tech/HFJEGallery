<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Spatie\Sluggable\Attributes\Sluggable;

#[Fillable(['name', 'slug', 'icon', 'image_path', 'sort_order', 'is_active'])]
#[Sluggable(from: 'name', to: 'slug')]
class LivingFeeling extends Model
{
    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['sort_order' => 'integer', 'is_active' => 'boolean'];
    }

    /** @return BelongsToMany<LivingSpace, $this> */
    public function spaces(): BelongsToMany
    {
        return $this->belongsToMany(LivingSpace::class)->withTimestamps();
    }
}
