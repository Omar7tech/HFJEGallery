<?php

namespace Database\Factories;

use App\Models\BayteCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BayteCategory>
 */
class BayteCategoryFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->words(2, true),
            'sort_order' => 0,
        ];
    }
}
