<?php

namespace App\Http\Resources;

use App\Models\StepThree;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin StepThree
 */
class StepThreeResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array{id: string, name: string, icon: string|null}
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->slug,
            'name' => $this->name,
            'icon' => $this->getFirstMediaUrl('icon', 'webp') ?: null,
        ];
    }
}
