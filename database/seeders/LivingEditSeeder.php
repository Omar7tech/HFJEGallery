<?php

namespace Database\Seeders;

use App\Models\LivingFeeling;
use App\Models\LivingSpace;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LivingEditSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            $feelings = [
                ['warm', 'Warm', 'Sun'],
                ['refined', 'Refined', 'Amphora'],
                ['social', 'Social', 'House'],
                ['grounded', 'Grounded', 'Leaf'],
                ['expressive', 'Expressive', null],
                ['calm', 'Calm', null],
            ];
            $feelingIds = [];

            foreach ($feelings as $order => [$slug, $name, $icon]) {
                $feeling = LivingFeeling::firstOrCreate(
                    ['slug' => $slug],
                    ['name' => $name, 'icon' => $icon, 'sort_order' => $order],
                );
                $feelingIds[] = $feeling->getKey();
            }

            $spaces = [
                ['living-room', 'Living room', 'Sofa'],
                ['kitchen', 'Kitchen', 'CookingPot'],
                ['bed-room', 'Bed room', 'BedDouble'],
                ['dining-room', 'Dining room', 'UtensilsCrossed'],
            ];

            foreach ($spaces as $order => [$slug, $name, $icon]) {
                $space = LivingSpace::firstOrCreate(
                    ['slug' => $slug],
                    ['name' => $name, 'icon' => $icon, 'sort_order' => $order],
                );
                $space->feelings()->syncWithoutDetaching($feelingIds);
            }
        });
    }
}
