<?php

namespace Database\Factories;

use App\Enums\MoodBoardImageSlot;
use App\Models\GalleryImage;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<GalleryImage>
 */
class GalleryImageFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'slot' => fake()->randomElement(MoodBoardImageSlot::cases()),
            'alt_text' => fake()->sentence(4),
            'is_active' => true,
        ];
    }

    public function slot(MoodBoardImageSlot $slot): static
    {
        return $this->state(['slot' => $slot]);
    }

    public function inactive(): static
    {
        return $this->state(['is_active' => false]);
    }
}
