<?php

use App\Enums\LivingEditStep;
use App\Enums\MoodBoardImageSlot;
use App\Models\GalleryImage;
use App\Models\LivingEditOption;
use App\Models\LivingSpace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Illuminate\Testing\TestResponse;

uses(RefreshDatabase::class);

beforeEach(function () {
    Storage::fake('public');
});

/**
 * @param  array<string, mixed>  $query
 */
function getMoodBoard(array $query): TestResponse
{
    return test()->getJson(route('living-edit.mood-board', $query));
}

/**
 * The image id shown in a slot, or null when the slot is empty.
 */
function boardImageId(TestResponse $response, MoodBoardImageSlot $slot): ?int
{
    return collect($response->json('slots'))->firstWhere('slot', $slot->value)['image']['id'] ?? null;
}

/**
 * @param  list<LivingEditOption>  $options
 */
function galleryImage(MoodBoardImageSlot $slot, LivingSpace $space, array $options = []): GalleryImage
{
    $image = GalleryImage::factory()
        ->slot($slot)
        ->withImage()
        ->hasAttached($space, relationship: 'spaces')
        ->create();

    $image->options()->attach(collect($options)->pluck('id'));

    return $image;
}

test('the board fills every position with the image matching the most steps', function () {
    $kitchen = LivingSpace::create(['name' => 'Kitchen']);
    $warm = LivingEditOption::factory()->step(LivingEditStep::One)->create(['name' => 'Warm']);
    $calm = LivingEditOption::factory()->step(LivingEditStep::One)->create(['name' => 'Calm']);
    $oak = LivingEditOption::factory()->step(LivingEditStep::Three)->create(['name' => 'Oak']);

    $warmAndOak = galleryImage(MoodBoardImageSlot::Large, $kitchen, [$warm, $oak]);
    $warmAndCalm = galleryImage(MoodBoardImageSlot::Large, $kitchen, [$warm, $calm]);
    galleryImage(MoodBoardImageSlot::Large, $kitchen);

    foreach ([MoodBoardImageSlot::TopRight, MoodBoardImageSlot::SmallLeft, MoodBoardImageSlot::SmallMiddle, MoodBoardImageSlot::SmallRight] as $slot) {
        galleryImage($slot, $kitchen);
    }

    $response = getMoodBoard(['space' => 'kitchen', 'step1' => 'warm,calm', 'step3' => 'oak'])
        ->assertOk()
        ->assertHeader('Cache-Control', 'max-age=60, private')
        ->assertJsonCount(5, 'slots')
        ->assertJsonPath('slots.0.slot', MoodBoardImageSlot::Large->value)
        ->assertJsonPath('slots.0.image.url', $warmAndOak->getFirstMediaUrl('image', 'webp'))
        ->assertJsonPath('slots.0.image.thumbUrl', $warmAndOak->getFirstMediaUrl('image', 'thumb'))
        ->assertJsonPath('slots.0.image.alt', $warmAndOak->alt_text);

    expect(boardImageId($response, MoodBoardImageSlot::Large))->toBe($warmAndOak->id)
        ->and(boardImageId($response, MoodBoardImageSlot::Large))->not->toBe($warmAndCalm->id);

    foreach (MoodBoardImageSlot::cases() as $slot) {
        expect(boardImageId($response, $slot))->not->toBeNull();
    }
});

test('only active images with a file in the chosen space are used while the space has any', function () {
    $kitchen = LivingSpace::create(['name' => 'Kitchen']);
    $bedroom = LivingSpace::create(['name' => 'Bedroom']);
    $warm = LivingEditOption::factory()->step(LivingEditStep::One)->create(['name' => 'Warm']);

    $kitchenImage = galleryImage(MoodBoardImageSlot::TopRight, $kitchen);
    galleryImage(MoodBoardImageSlot::TopRight, $bedroom, [$warm]);
    GalleryImage::factory()->slot(MoodBoardImageSlot::TopRight)->inactive()->withImage()->hasAttached($kitchen, relationship: 'spaces')->hasAttached($warm, relationship: 'options')->create();
    GalleryImage::factory()->slot(MoodBoardImageSlot::TopRight)->hasAttached($kitchen, relationship: 'spaces')->hasAttached($warm, relationship: 'options')->create();

    $response = getMoodBoard(['space' => 'kitchen', 'step1' => 'warm'])->assertOk();

    expect(boardImageId($response, MoodBoardImageSlot::TopRight))->toBe($kitchenImage->id);
});

test('a position the space has no image for is filled from another space, or left empty when none exists', function () {
    $kitchen = LivingSpace::create(['name' => 'Kitchen']);
    $bedroom = LivingSpace::create(['name' => 'Bedroom']);
    $bedroomImage = galleryImage(MoodBoardImageSlot::SmallRight, $bedroom);

    $response = getMoodBoard(['space' => 'kitchen'])->assertOk();

    expect(boardImageId($response, MoodBoardImageSlot::SmallRight))->toBe($bedroomImage->id)
        ->and(boardImageId($response, MoodBoardImageSlot::Large))->toBeNull();
});

test('choices of inactive options or from another step do not change the ranking', function () {
    $kitchen = LivingSpace::create(['name' => 'Kitchen']);
    $hidden = LivingEditOption::factory()->step(LivingEditStep::One)->inactive()->create(['name' => 'Hidden']);
    $oak = LivingEditOption::factory()->step(LivingEditStep::Three)->create(['name' => 'Oak']);
    $plain = galleryImage(MoodBoardImageSlot::Large, $kitchen);
    galleryImage(MoodBoardImageSlot::Large, $kitchen, [$hidden, $oak]);

    $seedPicking = fn (int $seed): ?int => boardImageId(getMoodBoard(['space' => 'kitchen', 'step1' => 'hidden,oak', 'seed' => $seed]), MoodBoardImageSlot::Large);

    $picks = collect(range(0, 30))->map($seedPicking)->unique();

    expect($picks)->toContain($plain->id)->toHaveCount(2);
});

test('the same choices and seed give the same board and another seed can shuffle equal matches', function () {
    $kitchen = LivingSpace::create(['name' => 'Kitchen']);
    $images = collect(range(1, 6))->map(fn (): GalleryImage => galleryImage(MoodBoardImageSlot::SmallMiddle, $kitchen));

    $pick = fn (int $seed): ?int => boardImageId(getMoodBoard(['space' => 'kitchen', 'seed' => $seed]), MoodBoardImageSlot::SmallMiddle);

    expect($pick(7))->toBe($pick(7))
        ->and(collect(range(0, 20))->map($pick)->unique()->count())->toBeGreaterThan(1)
        ->and($images->pluck('id'))->toContain($pick(7));
});

test('an image already on the board stays while it still matches best', function () {
    $kitchen = LivingSpace::create(['name' => 'Kitchen']);
    $warm = LivingEditOption::factory()->step(LivingEditStep::One)->create(['name' => 'Warm']);
    $images = collect(range(1, 5))->map(fn (): GalleryImage => galleryImage(MoodBoardImageSlot::Large, $kitchen, [$warm]));
    $plain = galleryImage(MoodBoardImageSlot::Large, $kitchen);

    foreach ($images as $image) {
        expect(boardImageId(getMoodBoard(['space' => 'kitchen', 'step1' => 'warm', 'keep' => [$image->id]]), MoodBoardImageSlot::Large))->toBe($image->id);
    }

    expect(boardImageId(getMoodBoard(['space' => 'kitchen', 'step1' => 'warm', 'keep' => [$plain->id]]), MoodBoardImageSlot::Large))
        ->not->toBe($plain->id);
});

test('an unknown or inactive space is not found', function (array $space) {
    LivingSpace::create($space);

    getMoodBoard(['space' => 'garage'])->assertNotFound();
})->with([
    'unknown' => [['name' => 'Kitchen']],
    'inactive' => [['name' => 'Garage', 'is_active' => false]],
]);

test('malformed choices are rejected', function (array $query, string $invalidField) {
    getMoodBoard(['space' => 'kitchen', ...$query])
        ->assertUnprocessable()
        ->assertJsonValidationErrors($invalidField);
})->with([
    'missing space' => [['space' => null], 'space'],
    'space with sql' => [['space' => "kitchen' or 1=1 --"], 'space'],
    'more than three options in a step' => [['step1' => 'a,b,c,d'], 'step1'],
    'option with invalid characters' => [['step2' => 'warm;drop'], 'step2'],
    'negative seed' => [['seed' => -1], 'seed'],
    'too many kept images' => [['keep' => [1, 2, 3, 4, 5, 6]], 'keep'],
    'kept image that is not an id' => [['keep' => ['abc']], 'keep.0'],
]);

test('the board is rate limited', function () {
    LivingSpace::create(['name' => 'Kitchen']);

    foreach (range(1, 120) as $attempt) {
        getMoodBoard(['space' => 'kitchen'])->assertOk();
    }

    getMoodBoard(['space' => 'kitchen'])->assertTooManyRequests();
});
