<?php

namespace Database\Seeders;

use App\Models\BayteCategory;
use App\Models\BayteProduct;
use Illuminate\Database\Seeder;

/**
 * The starting BAYTE collection. Every piece gets the placeholder cutout;
 * real photography is uploaded per product in the dashboard.
 */
class BayteSeeder extends Seeder
{
    /**
     * @var array<string, list<array{name: string, description: string}>>
     */
    private const CATALOGUE = [
        'Lounge Chairs' => [
            ['name' => 'Sannine', 'description' => 'A deep oak shell and a cushion you sink into.'],
            ['name' => 'Byblos', 'description' => 'Wide arms and a low back, built around long conversations.'],
            ['name' => 'Qadisha', 'description' => 'A quiet lounge chair in cream boucle and warm wood.'],
            ['name' => 'Cedra', 'description' => 'Cedar frame and a leather sling, the first BAYTE piece.'],
        ],
        'Chaises & Daybeds' => [
            ['name' => 'Raouche', 'description' => 'Full-length caramel leather, cut for an open wall.'],
            ['name' => 'Batroun', 'description' => 'A daybed sized for an afternoon, not a night.'],
            ['name' => 'Jounieh', 'description' => 'A chaise that faces the light and holds the view.'],
            ['name' => 'Saida', 'description' => 'A low daybed with a removable bolster.'],
        ],
        'Floor Seating' => [
            ['name' => 'Zaitoun', 'description' => 'A soft floor seat that moves with the evening.'],
            ['name' => 'Mina', 'description' => 'The floor cushion that becomes the extra seat.'],
            ['name' => 'Bekaa', 'description' => 'Oversized and unstructured, made to be dropped anywhere.'],
            ['name' => 'Tyr', 'description' => 'A round floor seat for the room without a sofa.'],
        ],
        'Accent Seating' => [
            ['name' => 'Achrafieh', 'description' => 'A compact reading chair for the corner by the window.'],
            ['name' => 'Chouf', 'description' => 'A sculpted back in solid ash, finished by hand.'],
            ['name' => 'Hamra', 'description' => 'A slim occasional chair that disappears when unused.'],
            ['name' => 'Mashrabiya', 'description' => 'A latticed back and a cushioned seat, from the old house.'],
        ],
    ];

    public function run(): void
    {
        foreach (array_values(self::CATALOGUE) as $categoryIndex => $pieces) {
            $name = array_keys(self::CATALOGUE)[$categoryIndex];

            $category = BayteCategory::firstOrCreate(
                ['name' => $name],
                ['sort_order' => $categoryIndex],
            );

            foreach ($pieces as $pieceIndex => $piece) {
                $product = BayteProduct::firstOrCreate(
                    ['name' => $piece['name']],
                    [
                        'bayte_category_id' => $category->id,
                        'description' => $piece['description'],
                        'sort_order' => $pieceIndex,
                    ],
                );

                if (! $product->hasMedia('image')) {
                    $product->addMedia(BayteProduct::placeholderImagePath())
                        ->preservingOriginal()
                        ->toMediaCollection('image');
                }
            }
        }
    }
}
