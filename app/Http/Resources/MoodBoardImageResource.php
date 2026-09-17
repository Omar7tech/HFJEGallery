<?php

namespace App\Http\Resources;

use App\Models\GalleryImage;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin GalleryImage
 */
class MoodBoardImageResource extends JsonResource
{
    /**
     * Only what the board renders: public WebP URLs and the alt text.
     *
     * @return array{id: int, url: string, thumbUrl: string, alt: string}
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'url' => $this->getFirstMediaUrl('image', 'webp'),
            'thumbUrl' => $this->getFirstMediaUrl('image', 'thumb'),
            'alt' => $this->alt_text ?? '',
        ];
    }
}
