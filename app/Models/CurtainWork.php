<?php

namespace App\Models;

use App\Models\Concerns\IsPortfolioPiece;
use Database\Factories\CurtainWorkFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\Sluggable\Attributes\Sluggable;

/**
 * One finished curtain project: a cover, a short story and a gallery, shown
 * on the Curtains page and in the curtain work portfolio. Unlike a work
 * project it belongs to no category.
 */
#[Fillable(['name', 'slug', 'location', 'year', 'summary', 'description', 'sort_order'])]
#[Sluggable(from: 'name', to: 'slug')]
class CurtainWork extends Model implements HasMedia
{
    /** @use HasFactory<CurtainWorkFactory> */
    use HasFactory;

    use IsPortfolioPiece;
}
