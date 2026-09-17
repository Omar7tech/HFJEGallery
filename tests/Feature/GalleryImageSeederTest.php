<?php

use App\Enums\LivingEditStep;
use App\Enums\MoodBoardImageSlot;
use App\Models\GalleryImage;
use App\Models\LivingEditOption;
use App\Models\LivingSpace;
use Database\Seeders\GalleryImageSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

/**
 * Runs the seeder with a small number of images per space and position to keep the test fast.
 */
function seedDemoGallery(int $imagesPerSpaceAndSlot = 2): void
{
    $seeder = new GalleryImageSeeder;
    $seeder->imagesPerSpaceAndSlot = $imagesPerSpaceAndSlot;
    app()->instance(GalleryImageSeeder::class, $seeder);

    test()->seed(GalleryImageSeeder::class);
}

test('demo images cover every space and position with options from every step', function () {
    Storage::fake('public');
    $spaces = collect(['Kitchen', 'Bedroom'])->map(fn (string $name): LivingSpace => LivingSpace::create(['name' => $name]));

    foreach (LivingEditStep::cases() as $step) {
        LivingEditOption::factory()->step($step)->count(3)->create();
    }

    seedDemoGallery();

    $images = GalleryImage::with(['spaces', 'options', 'media'])->get();

    expect($images)->toHaveCount(2 * count(MoodBoardImageSlot::cases()) * 2);

    foreach ($spaces as $space) {
        foreach (MoodBoardImageSlot::cases() as $slot) {
            expect($images->filter(fn (GalleryImage $image): bool => $image->slot === $slot && $image->spaces->contains($space)))
                ->not->toBeEmpty();
        }
    }

    foreach ($images as $image) {
        $media = $image->getFirstMedia('image');

        expect($media)->not->toBeNull()
            ->and($media->hasGeneratedConversion('webp'))->toBeTrue()
            ->and($image->spaces)->not->toBeEmpty();

        foreach (LivingEditStep::cases() as $step) {
            expect($image->options->where('step', $step))->not->toBeEmpty();
        }
    }
});

test('demo images are not added twice', function () {
    Storage::fake('public');
    LivingSpace::create(['name' => 'Kitchen']);

    foreach (LivingEditStep::cases() as $step) {
        LivingEditOption::factory()->step($step)->create();
    }

    seedDemoGallery(imagesPerSpaceAndSlot: 1);
    seedDemoGallery(imagesPerSpaceAndSlot: 1);

    expect(GalleryImage::count())->toBe(count(MoodBoardImageSlot::cases()));
});

test('the demo gallery needs options in every step', function () {
    LivingSpace::create(['name' => 'Kitchen']);
    LivingEditOption::factory()->step(LivingEditStep::One)->create();

    seedDemoGallery();
})->throws(RuntimeException::class, 'Seed spaces and options for every step first');
