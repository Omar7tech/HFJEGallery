<?php

namespace Database\Seeders;

use App\Models\CurtainStyle;
use Illuminate\Database\Seeder;

/**
 * The six curtain styles the page launched with, each with the photo already
 * shipped in public/images/curtains. The originals are copied, never moved.
 */
class CurtainStyleSeeder extends Seeder
{
    /** @var list<array{name: string, image: string, description: string}> */
    private const STYLES = [
        ['name' => 'Sheer curtains', 'image' => 'layered-curtains', 'description' => 'Soft daylight, filtered through sheer fabric.'],
        ['name' => 'Blackout curtains', 'image' => 'blackout-curtains', 'description' => 'Privacy and complete light control.'],
        ['name' => 'Eyelet curtains', 'image' => 'eyelet-curtains', 'description' => 'Clean folds with a contemporary finish.'],
        ['name' => 'Layered curtains', 'image' => 'sheer-curtains', 'description' => 'Sheer and heavier fabrics, working together.'],
        ['name' => 'Pleated curtains', 'image' => 'pleated-curtains', 'description' => 'Tailored pleats and a structured drape.'],
        ['name' => 'Decorative fabrics', 'image' => 'curtain-fabrics', 'description' => 'Texture and warmth for the finishing layer.'],
    ];

    public function run(): void
    {
        if (CurtainStyle::query()->exists()) {
            $this->command->warn('Curtain styles already exist, skipping.');

            return;
        }

        foreach (self::STYLES as $index => $style) {
            CurtainStyle::create([
                'name' => $style['name'],
                'description' => $style['description'],
                'sort_order' => $index,
            ])
                ->addMedia(public_path("images/curtains/{$style['image']}.webp"))
                ->preservingOriginal()
                ->toMediaCollection('image');
        }

        $this->command->info('Created '.count(self::STYLES).' curtain styles.');
    }
}
