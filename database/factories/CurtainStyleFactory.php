<?php

namespace Database\Factories;

use App\Models\CurtainStyle;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<CurtainStyle>
 */
class CurtainStyleFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            // The first word is unique, which keeps the whole name unique.
            'name' => Str::title(fake()->unique()->word().' curtains'),
            'description' => fake()->sentence(7),
            'sort_order' => 0,
            'is_active' => true,
        ];
    }

    /**
     * Hidden from the site.
     */
    public function inactive(): static
    {
        return $this->state(['is_active' => false]);
    }
}
