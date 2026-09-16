<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Fillable(['name', 'slug', 'icon', 'image_path', 'sort_order', 'is_active'])]
class LivingSpace extends Model
{
    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['sort_order' => 'integer', 'is_active' => 'boolean'];
    }

    /** @return BelongsToMany<LivingFeeling, $this> */
    public function feelings(): BelongsToMany
    {
        return $this->belongsToMany(LivingFeeling::class)->withTimestamps();
    }
}
