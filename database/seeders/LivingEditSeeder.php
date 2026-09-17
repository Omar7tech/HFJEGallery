<?php

namespace Database\Seeders;

use App\Models\LivingSpace;
use App\Models\StepTwo;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LivingEditSeeder extends Seeder
{
    public function run(): void
    {
        if (LivingSpace::exists() || StepTwo::exists()) {
            return;
        }

        DB::transaction(function () {
            $spaces = ['Living room', 'Kitchen', 'Bed room', 'Dining room'];

            foreach ($spaces as $order => $name) {
                LivingSpace::create(['name' => $name, 'sort_order' => $order]);
            }

            $stepTwoOptions = ['Warm', 'Refined', 'Social', 'Grounded', 'Expressive', 'Calm'];

            foreach ($stepTwoOptions as $order => $name) {
                StepTwo::create(['name' => $name, 'sort_order' => $order]);
            }
        });
    }
}
