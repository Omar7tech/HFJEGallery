<?php

namespace Database\Factories;

use App\Enums\LivingEditStep;
use App\Models\LivingEditOption;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LivingEditOption>
 */
class LivingEditOptionFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'step' => fake()->randomElement(LivingEditStep::cases()),
            'name' => fake()->unique()->words(2, true),
            'sort_order' => 0,
            'is_active' => true,
        ];
    }

    public function step(LivingEditStep $step): static
    {
        return $this->state(['step' => $step]);
    }

    public function inactive(): static
    {
        return $this->state(['is_active' => false]);
    }
}
