<?php

namespace Database\Factories;

use App\Models\BayteCategory;
use App\Models\BayteProduct;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<BayteProduct>
 */
class BayteProductFactory extends Factory
{
    /**
     * No image is attached: a piece without an upload falls back to the
     * placeholder cutout.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'bayte_category_id' => BayteCategory::factory(),
            // The first word is unique, which keeps the whole name unique.
            'name' => Str::title(fake()->unique()->word().' '.fake()->word()),
            'description' => fake()->sentence(8),
            'sort_order' => 0,
        ];
    }
}
