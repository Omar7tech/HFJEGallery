<?php

namespace Database\Seeders;

use App\Models\BayteCategory;
use App\Models\BayteProduct;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\Sequence;
use Illuminate\Database\Seeder;

/**
 * Demo BAYTE collection: twelve categories with pieces spread randomly over
 * them. No images are seeded — every piece shows the placeholder cutout until
 * a photo is uploaded in the dashboard.
 */
class BayteSeeder extends Seeder
{
    /** @var list<string> */
    private const CATEGORIES = [
        'Lounge Chairs',
        'Sofas',
        'Chaises & Daybeds',
        'Floor Seating',
        'Accent Seating',
        'Dining Chairs',
        'Dining Tables',
        'Coffee Tables',
        'Sideboards',
        'Shelving',
        'Beds',
        'Lighting',
    ];

    private const PRODUCT_COUNT = 150;

    public function run(): void
    {
        $categories = $this->categories();

        if (BayteProduct::query()->exists()) {
            $this->command->warn('BAYTE products already exist, skipping.');

            return;
        }

        BayteProduct::factory()
            ->count(self::PRODUCT_COUNT)
            ->sequence(fn (Sequence $sequence): array => [
                'bayte_category_id' => $categories->random()->id,
                'sort_order' => $sequence->index,
            ])
            ->create();
    }

    /**
     * @return Collection<int, BayteCategory>
     */
    private function categories(): Collection
    {
        return BayteCategory::query()
            ->findMany(
                collect(self::CATEGORIES)
                    ->map(fn (string $name, int $index): int => BayteCategory::firstOrCreate(
                        ['name' => $name],
                        ['sort_order' => $index],
                    )->id)
                    ->all(),
            );
    }
}
