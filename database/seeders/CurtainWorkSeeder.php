<?php

namespace Database\Seeders;

use App\Models\CurtainWork;
use Illuminate\Database\Seeder;

/**
 * Demo curtain portfolio. Covers and galleries reuse the photos already shipped
 * in public/images/curtains; the originals are copied, never moved.
 */
class CurtainWorkSeeder extends Seeder
{
    /** @var list<array{name: string, location: string, year: int}> */
    private const WORKS = [
        ['name' => 'Achrafieh Sheer Living Room', 'location' => 'Achrafieh, Beirut', 'year' => 2025],
        ['name' => 'Broummana Blackout Suite', 'location' => 'Broummana', 'year' => 2025],
        ['name' => 'Gemmayze Layered Loft', 'location' => 'Gemmayze, Beirut', 'year' => 2024],
        ['name' => 'Faqra Chalet Drapes', 'location' => 'Faqra', 'year' => 2024],
        ['name' => 'Batroun Seaside Sheers', 'location' => 'Batroun', 'year' => 2024],
        ['name' => 'Baabdat Pleated Dining Room', 'location' => 'Baabdat', 'year' => 2023],
        ['name' => 'Jounieh Eyelet Bedroom', 'location' => 'Jounieh', 'year' => 2023],
        ['name' => 'Hazmieh Garden Flat Curtains', 'location' => 'Hazmieh', 'year' => 2022],
        ['name' => 'Byblos Harbour Apartment', 'location' => 'Byblos', 'year' => 2022],
        ['name' => 'Zalka Showroom Textiles', 'location' => 'Zalka', 'year' => 2021],
    ];

    /** Photos from public/images/curtains, reused as demo covers and galleries. */
    private const PHOTOS = [
        'curtain-portfolio.webp',
        'layered-curtains.webp',
        'blackout-curtains.webp',
        'pleated-curtains.webp',
        'eyelet-curtains.webp',
        'sheer-curtains.webp',
        'curtain-fabrics.webp',
        'curtain-light.webp',
    ];

    private const GALLERY_SIZE = 4;

    public function run(): void
    {
        if (CurtainWork::query()->exists()) {
            $this->command->warn('Curtain works already exist, skipping.');

            return;
        }

        foreach (self::WORKS as $index => $details) {
            $work = CurtainWork::create([
                ...$details,
                'summary' => "Made-to-measure curtains for a {$details['location']} home, from fabric choice to the final fitting.",
                'description' => '<p>Every panel was cut and tailored for the room it hangs in, balancing daylight, privacy and the proportions of each window.</p><p>From <strong>sheers and linings</strong> to tracks and tiebacks, HFJE handled the whole finishing layer so the space feels complete.</p>',
                'sort_order' => $index,
            ]);

            $this->attachPhoto($work, 'cover', $index);

            for ($image = 1; $image <= self::GALLERY_SIZE; $image++) {
                $this->attachPhoto($work, 'gallery', $index + $image);
            }
        }

        $this->command->info('Created '.count(self::WORKS).' demo curtain works.');
    }

    /**
     * Copies one of the shipped photos into a media collection, cycling through the set.
     */
    private function attachPhoto(CurtainWork $work, string $collection, int $index): void
    {
        $work->addMedia(public_path('images/curtains/'.self::PHOTOS[$index % count(self::PHOTOS)]))
            ->preservingOriginal()
            ->toMediaCollection($collection);
    }
}
