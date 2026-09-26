<?php

namespace Database\Factories;

use App\Models\BayteCategory;
use App\Models\BayteProduct;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BayteProduct>
 */
class BayteProductFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'bayte_category_id' => BayteCategory::factory(),
            'name' => fake()->unique()->words(2, true),
            'description' => fake()->sentence(),
            'sort_order' => 0,
        ];
    }

    /**
     * Attach the placeholder cutout, so the card has an image to show.
     */
    public function withImage(): static
    {
        return $this->afterCreating(function (BayteProduct $product): void {
            $product->addMedia(BayteProduct::placeholderImagePath())
                ->preservingOriginal()
                ->toMediaCollection('image');
        });
    }
}
