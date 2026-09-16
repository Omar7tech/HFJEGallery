<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Fillable(['name', 'slug', 'icon', 'image_path', 'sort_order', 'is_active'])]
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
