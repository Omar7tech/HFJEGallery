<?php

namespace Database\Seeders;

use App\Models\LivingSpace;
use App\Models\StepOne;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LivingEditSeeder extends Seeder
{
    public function run(): void
    {
        if (LivingSpace::exists() || StepOne::exists()) {
            return;
        }

        DB::transaction(function () {
            $spaces = ['Living room', 'Kitchen', 'Bed room', 'Dining room'];

            foreach ($spaces as $order => $name) {
                LivingSpace::create(['name' => $name, 'sort_order' => $order]);
            }

            $stepOneOptions = ['Warm', 'Refined', 'Social', 'Grounded', 'Expressive', 'Calm'];

            foreach ($stepOneOptions as $order => $name) {
                StepOne::create(['name' => $name, 'sort_order' => $order]);
            }
        });
    }
}
