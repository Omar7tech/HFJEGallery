<?php

namespace Database\Factories;

use App\Models\Project;
use App\Models\WorkCategory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Project>
 */
class ProjectFactory extends Factory
{
    /**
     * No cover or gallery is attached: a project without an upload falls back
     * to the placeholder image.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'work_category_id' => WorkCategory::factory(),
            // The first word is unique, which keeps the whole name unique.
            'name' => Str::title(fake()->unique()->word().' '.fake()->word()),
            'location' => fake()->city(),
            'year' => fake()->numberBetween(2008, 2026),
            'summary' => fake()->sentence(10),
            'description' => fake()->paragraphs(2, true),
            'sort_order' => 0,
        ];
    }
}
