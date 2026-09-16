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
        if (LivingSpace::exists() || LivingFeeling::exists()) {
            return;
        }

        DB::transaction(function () {
            $feelings = ['Warm', 'Refined', 'Social', 'Grounded', 'Expressive', 'Calm'];
            $feelingIds = [];

            foreach ($feelings as $order => $name) {
                $feelingIds[] = LivingFeeling::create(['name' => $name, 'sort_order' => $order])->getKey();
            }

            $spaces = ['Living room', 'Kitchen', 'Bed room', 'Dining room'];

            foreach ($spaces as $order => $name) {
                LivingSpace::create(['name' => $name, 'sort_order' => $order])
                    ->feelings()
                    ->attach($feelingIds);
            }
        });
    }
}
