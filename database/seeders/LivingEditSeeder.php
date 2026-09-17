<?php

namespace Database\Seeders;

use App\Enums\LivingEditStep;
use App\Models\LivingEditOption;
use App\Models\LivingSpace;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LivingEditSeeder extends Seeder
{
    /** @var list<string> */
    private const array SPACES = ['Living room', 'Kitchen', 'Bed room', 'Dining room'];

    /**
     * Starter option names, keyed by step number, in display order.
     *
     * @var array<int, list<string>>
     */
    private const array OPTIONS = [
        LivingEditStep::One->value => ['Warm', 'Refined', 'Social', 'Grounded', 'Expressive', 'Calm'],
        LivingEditStep::Two->value => ['Morning coffee', 'Hosting friends', 'Quiet reading', 'Family dinner', 'Slow weekends', 'Working from home'],
        LivingEditStep::Three->value => ['Oak', 'Linen', 'Marble', 'Brass', 'Rattan', 'Terracotta'],
        LivingEditStep::Four->value => ['Earthy', 'Neutral', 'Monochrome', 'Soft pastel', 'Bold', 'Natural'],
    ];

    public function run(): void
    {
        if (LivingSpace::exists() || LivingEditOption::exists()) {
            return;
        }

        DB::transaction(function () {
            foreach (self::SPACES as $order => $name) {
                LivingSpace::create(['name' => $name, 'sort_order' => $order]);
            }

            foreach (self::OPTIONS as $step => $names) {
                foreach ($names as $order => $name) {
                    LivingEditOption::create(['step' => $step, 'name' => $name, 'sort_order' => $order]);
                }
            }
        });
    }
}
