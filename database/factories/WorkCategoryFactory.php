<?php

namespace Database\Factories;

use App\Models\WorkCategory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<WorkCategory>
 */
class WorkCategoryFactory extends Factory
{
    /**
     * No image is attached: a category without an upload falls back to the
     * placeholder image.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            // The first word is unique, which keeps the whole name unique.
            'name' => Str::title(fake()->unique()->word().' '.fake()->word()),
            'description' => fake()->sentence(12),
            'sort_order' => 0,
        ];
    }
}
