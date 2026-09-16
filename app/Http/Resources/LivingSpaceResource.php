<?php

namespace App\Http\Resources;

use App\Models\LivingSpace;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin LivingSpace
 */
class LivingSpaceResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array{id: string, name: string, icon: string|null, feelings?: array<int, array{id: string, name: string, icon: string|null}>}
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->slug,
            'name' => $this->name,
            'icon' => $this->getFirstMediaUrl('icon', 'webp') ?: null,
            'feelings' => $this->whenLoaded('feelings', fn (): array => LivingFeelingResource::collection($this->feelings)->resolve($request)),
        ];
    }
}
