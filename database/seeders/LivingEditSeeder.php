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
                ['warm', 'Warm'],
                ['refined', 'Refined'],
                ['social', 'Social'],
                ['grounded', 'Grounded'],
                ['expressive', 'Expressive'],
                ['calm', 'Calm'],
            ];
            $feelingIds = [];

            foreach ($feelings as $order => [$slug, $name]) {
                $feeling = LivingFeeling::firstOrCreate(
                    ['slug' => $slug],
                    ['name' => $name, 'sort_order' => $order],
                );
                $feelingIds[] = $feeling->getKey();
            }

            $spaces = [
                ['living-room', 'Living room'],
                ['kitchen', 'Kitchen'],
                ['bed-room', 'Bed room'],
                ['dining-room', 'Dining room'],
            ];

            foreach ($spaces as $order => [$slug, $name]) {
                $space = LivingSpace::firstOrCreate(
                    ['slug' => $slug],
                    ['name' => $name, 'sort_order' => $order],
                );
                $space->feelings()->syncWithoutDetaching($feelingIds);
            }
        });
    }
}
