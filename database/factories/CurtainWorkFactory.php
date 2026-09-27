<?php

namespace Database\Factories;

use App\Models\CurtainWork;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<CurtainWork>
 */
class CurtainWorkFactory extends Factory
{
    /**
     * No cover or gallery is attached: a work without an upload falls back to
     * the placeholder image.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            // The first word is unique, which keeps the whole name unique.
            'name' => Str::title(fake()->unique()->word().' '.fake()->word()),
            'location' => fake()->city(),
            'year' => fake()->numberBetween(2008, 2026),
            'summary' => fake()->sentence(10),
            // Rich-editor HTML, as the dashboard stores it.
            'description' => '<p>'.fake()->paragraph().'</p><p>'.fake()->paragraph().'</p>',
            'sort_order' => 0,
        ];
    }
}
