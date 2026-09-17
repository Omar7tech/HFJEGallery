<?php

namespace Database\Seeders;

use App\Models\LivingSpace;
use App\Models\StepFour;
use App\Models\StepOne;
use App\Models\StepThree;
use App\Models\StepTwo;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LivingEditSeeder extends Seeder
{
    /**
     * Starter names for each Living Edit model, in display order.
     *
     * @var array<class-string<Model>, list<string>>
     */
    private const array RECORDS = [
        LivingSpace::class => ['Living room', 'Kitchen', 'Bed room', 'Dining room'],
        StepOne::class => ['Warm', 'Refined', 'Social', 'Grounded', 'Expressive', 'Calm'],
        StepTwo::class => ['Morning coffee', 'Hosting friends', 'Quiet reading', 'Family dinner', 'Slow weekends', 'Working from home'],
        StepThree::class => ['Oak', 'Linen', 'Marble', 'Brass', 'Rattan', 'Terracotta'],
        StepFour::class => ['Earthy', 'Neutral', 'Monochrome', 'Soft pastel', 'Bold', 'Natural'],
    ];

    public function run(): void
    {
        foreach (array_keys(self::RECORDS) as $model) {
            if ($model::exists()) {
                return;
            }
        }

        DB::transaction(function () {
            foreach (self::RECORDS as $model => $names) {
                foreach ($names as $order => $name) {
                    $model::create(['name' => $name, 'sort_order' => $order]);
                }
            }
        });
    }
}
