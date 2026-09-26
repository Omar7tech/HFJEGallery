<?php

namespace App\Models;

use Database\Factories\BayteCategoryFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Sluggable\Attributes\Sluggable;

/**
 * A shelf of the BAYTE collection. Its slug is the ?category= value on the site.
 */
#[Fillable(['name', 'slug', 'sort_order'])]
#[Sluggable(from: 'name', to: 'slug')]
class BayteCategory extends Model
{
    /** @use HasFactory<BayteCategoryFactory> */
    use HasFactory;

    /** @return HasMany<BayteProduct, $this> */
    public function products(): HasMany
    {
        return $this->hasMany(BayteProduct::class);
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['sort_order' => 'integer'];
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
