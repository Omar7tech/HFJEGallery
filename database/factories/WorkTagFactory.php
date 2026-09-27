<?php

namespace Database\Factories;

use App\Models\WorkCategory;
use App\Models\WorkTag;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<WorkTag>
 */
class WorkTagFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'work_category_id' => WorkCategory::factory(),
            'name' => Str::title(fake()->unique()->word()),
            'sort_order' => 0,
        ];
    }
}
