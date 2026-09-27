<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\WorkCategory;
use Illuminate\Database\Seeder;
use Spatie\MediaLibrary\HasMedia;

/**
 * Demo portfolio: the four kinds of work named on the home page, each with an
 * image and a handful of projects. Covers and galleries reuse the photos
 * already shipped in public/images; the originals are copied, never moved.
 */
class WorkSeeder extends Seeder
{
    /** @var array<string, array{description: string, projects: list<array{name: string, location: string, year: int}>}> */
    private const CATEGORIES = [
        'Homes' => [
            'description' => 'Family houses shaped room by room around the way each household lives.',
            'projects' => [
                ['name' => 'Broummana Family House', 'location' => 'Broummana', 'year' => 2025],
                ['name' => 'Faqra Mountain Retreat', 'location' => 'Faqra', 'year' => 2024],
                ['name' => 'Batroun Seaside Villa', 'location' => 'Batroun', 'year' => 2024],
                ['name' => 'Baabdat Stone House', 'location' => 'Baabdat', 'year' => 2023],
                ['name' => 'Jounieh Hillside Home', 'location' => 'Jounieh', 'year' => 2022],
            ],
        ],
        'Apartments' => [
            'description' => 'City apartments where every metre is made to work and to feel calm.',
            'projects' => [
                ['name' => 'Achrafieh Penthouse', 'location' => 'Achrafieh, Beirut', 'year' => 2025],
                ['name' => 'Gemmayze Loft', 'location' => 'Gemmayze, Beirut', 'year' => 2024],
                ['name' => 'Ramlet El Bayda Residence', 'location' => 'Beirut', 'year' => 2023],
                ['name' => 'Hazmieh Garden Flat', 'location' => 'Hazmieh', 'year' => 2023],
            ],
        ],
        'Restaurants' => [
            'description' => 'Dining rooms with warmth, texture and light that guests remember.',
            'projects' => [
                ['name' => 'Mar Mikhael Bistro', 'location' => 'Mar Mikhael, Beirut', 'year' => 2025],
                ['name' => 'Byblos Harbour Kitchen', 'location' => 'Byblos', 'year' => 2024],
                ['name' => 'Saifi Village Café', 'location' => 'Saifi, Beirut', 'year' => 2022],
            ],
        ],
        'Commercial' => [
            'description' => 'Offices, showrooms and hospitality spaces with a residential ease.',
            'projects' => [
                ['name' => 'Dbayeh Showroom', 'location' => 'Dbayeh', 'year' => 2025],
                ['name' => 'Downtown Studio Offices', 'location' => 'Downtown Beirut', 'year' => 2024],
                ['name' => 'Zalka Design Gallery', 'location' => 'Zalka', 'year' => 2023],
            ],
        ],
    ];

    /** Photos from public/images, reused as demo covers and galleries. */
    private const PHOTOS = [
        'modern-living-room-interior-design.webp',
        'modern-living-room-interior-design (1).webp',
        'gray-stylish-modular-sofa-brick-marble-background-rustic-living-room.webp',
        'contemporary-house-interior-design.webp',
        'beige-sofa-contemporary-living-room-minimalist-interior-neutral-colors.webp',
        'potted-plant-table.webp',
        'women-opening-curtain.webp',
        'curtain.webp',
    ];

    private const GALLERY_SIZE = 4;

    public function run(): void
    {
        if (Project::query()->exists()) {
            $this->command->warn('Work projects already exist, skipping.');

            return;
        }

        $photo = 0;

        foreach (array_keys(self::CATEGORIES) as $categoryIndex => $name) {
            $category = WorkCategory::firstOrCreate(
                ['name' => $name],
                ['description' => self::CATEGORIES[$name]['description'], 'sort_order' => $categoryIndex],
            );

            $this->attachPhoto($category, 'image', $categoryIndex);

            foreach (self::CATEGORIES[$name]['projects'] as $projectIndex => $details) {
                $project = $category->projects()->create([
                    ...$details,
                    'summary' => "A {$details['location']} project, furnished and dressed by HFJE from the first sketch to the last cushion.",
                    'description' => "<p>Every piece in this {$category->name} project was chosen around the people who live and work in it.</p><p>From <strong>tailored curtains and upholstery</strong> to the final styling, HFJE shaped the light, the textures and the proportions of each room so the space feels complete.</p>",
                    'sort_order' => $projectIndex,
                ]);

                $this->attachPhoto($project, 'cover', $photo++);

                for ($image = 1; $image <= self::GALLERY_SIZE; $image++) {
                    $this->attachPhoto($project, 'gallery', $photo + $image);
                }
            }
        }

        $this->command->info('Created '.Project::query()->count().' demo projects.');
    }

    /**
     * Copies one of the shipped photos into a media collection, cycling through the set.
     */
    private function attachPhoto(HasMedia $model, string $collection, int $index): void
    {
        $model->addMedia(public_path('images/'.self::PHOTOS[$index % count(self::PHOTOS)]))
            ->preservingOriginal()
            ->toMediaCollection($collection);
    }
}
