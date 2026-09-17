<?php

use App\Enums\LivingEditStep;
use App\Enums\MoodBoardImageSlot;
use App\Filament\Resources\GalleryImages\GalleryImageResource;
use App\Filament\Resources\GalleryImages\Pages\CreateGalleryImage;
use App\Filament\Resources\GalleryImages\Pages\EditGalleryImage;
use App\Filament\Resources\GalleryImages\Pages\ListGalleryImages;
use App\Models\GalleryImage;
use App\Models\LivingEditOption;
use App\Models\LivingSpace;
use App\Models\User;
use Filament\Actions\Testing\TestAction;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Livewire\Livewire;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->actingAs(User::factory()->create());

    Filament::setCurrentPanel('admin');
});

/**
 * Creates one option in every step and returns them keyed by step number.
 *
 * @return array<int, LivingEditOption>
 */
function optionPerStep(string $name = 'Warm'): array
{
    return collect(LivingEditStep::cases())
        ->mapWithKeys(fn (LivingEditStep $step): array => [
            $step->value => LivingEditOption::factory()->step($step)->create(['name' => $name]),
        ])
        ->all();
}

/**
 * Form state that selects the given options, one field per step.
 *
 * @param  array<int, LivingEditOption>  $options
 * @return array<string, list<string>>
 */
function stepFormState(array $options): array
{
    return collect($options)
        ->mapWithKeys(fn (LivingEditOption $option, int $step): array => ["step_{$step}_options" => [(string) $option->id]])
        ->all();
}

test('gallery pages render', function () {
    optionPerStep();
    $image = GalleryImage::factory()->create();

    $this->get(GalleryImageResource::getUrl('index'))->assertSuccessful();
    $this->get(GalleryImageResource::getUrl('create'))->assertSuccessful();
    $this->get(GalleryImageResource::getUrl('edit', ['record' => $image]))->assertSuccessful();
});

test('an image is added with its space, step options and webp conversions', function () {
    Storage::fake('public');
    $space = LivingSpace::create(['name' => 'Kitchen']);
    $options = optionPerStep();

    Livewire::test(CreateGalleryImage::class)
        ->fillForm([
            'slot' => MoodBoardImageSlot::TopRight->value,
            'image' => [UploadedFile::fake()->image('kitchen.jpg', 1200, 1200)],
            'alt_text' => 'Warm oak kitchen',
            'spaces' => [$space->id],
            ...stepFormState($options),
        ])
        ->call('create')
        ->assertHasNoFormErrors()
        ->assertRedirect(GalleryImageResource::getUrl('index'));

    $image = GalleryImage::sole();
    $media = $image->getFirstMedia('image');

    expect($image->slot)->toBe(MoodBoardImageSlot::TopRight)
        ->and($image->alt_text)->toBe('Warm oak kitchen')
        ->and($image->is_active)->toBeTrue()
        ->and($image->spaces->modelKeys())->toBe([$space->id])
        ->and($image->options->modelKeys())->toEqualCanonicalizing(collect($options)->pluck('id')->all());

    expect($media->hasGeneratedConversion('webp'))->toBeTrue()
        ->and($media->hasGeneratedConversion('thumb'))->toBeTrue();
    Storage::disk('public')->assertExists($media->getPathRelativeToRoot('webp'));
});

test('an image needs a position, a file and at least one space', function () {
    optionPerStep();

    Livewire::test(CreateGalleryImage::class)
        ->fillForm(['slot' => MoodBoardImageSlot::Large->value, 'image' => [], 'spaces' => []])
        ->call('create')
        ->assertHasFormErrors(['image' => 'required', 'spaces' => 'required'])
        ->assertSee('Pick at least one space.')
        ->fillForm(['slot' => null])
        ->call('create')
        ->assertHasFormErrors(['slot' => 'required']);

    expect(GalleryImage::count())->toBe(0);
});

test('the upload and alt text appear only after a position is picked', function () {
    Livewire::test(CreateGalleryImage::class)
        ->assertFormFieldHidden('image')
        ->assertFormFieldHidden('alt_text')
        ->fillForm(['slot' => MoodBoardImageSlot::TopRight->value])
        ->assertFormFieldVisible('image')
        ->assertFormFieldVisible('alt_text')
        ->assertSee('Best at 1:1, the shape of the Top right position.');
});

test('the position picker offers every mood board position with its shape', function () {
    Livewire::test(CreateGalleryImage::class)
        ->assertSeeHtml('role="radiogroup"')
        ->assertSeeInOrder(['Large', '9:16', 'Top right', '1:1', 'Small left', '3:4', 'Small middle', '3:4', 'Small right', '3:4']);
});

test('a position that is not on the mood board is rejected', function () {
    Livewire::test(CreateGalleryImage::class)
        ->fillForm(['slot' => 9])
        ->call('create')
        ->assertHasFormErrors(['slot']);
});

test('the position picker is filled with the saved position when editing', function () {
    $image = GalleryImage::factory()->slot(MoodBoardImageSlot::SmallMiddle)->create();

    Livewire::test(EditGalleryImage::class, ['record' => $image->getRouteKey()])
        ->assertSchemaStateSet(['slot' => MoodBoardImageSlot::SmallMiddle->value]);
});

test('an image needs at least one option in every step', function (LivingEditStep $missingStep) {
    Storage::fake('public');
    $space = LivingSpace::create(['name' => 'Kitchen']);
    $options = optionPerStep();
    unset($options[$missingStep->value]);

    Livewire::test(CreateGalleryImage::class)
        ->fillForm([
            'slot' => MoodBoardImageSlot::Large->value,
            'image' => [UploadedFile::fake()->image('kitchen.jpg')],
            'spaces' => [$space->id],
            ...stepFormState($options),
        ])
        ->call('create')
        ->assertHasFormErrors(["step_{$missingStep->value}_options" => 'required'])
        ->assertSee("Pick at least one option for {$missingStep->getLabel()}.");

    expect(GalleryImage::count())->toBe(0);
})->with(LivingEditStep::cases());

test('a step without options links to where its options are added', function () {
    LivingEditOption::factory()->step(LivingEditStep::One)->create();

    Livewire::test(CreateGalleryImage::class)
        ->assertSee('Add options to Step 2')
        ->assertDontSee('Add options to Step 1');
});

test('editing one step keeps the options of the other steps', function () {
    Storage::fake('public');
    $options = optionPerStep();
    $newStepTwoOption = LivingEditOption::factory()->step(LivingEditStep::Two)->create(['name' => 'Calm']);
    $image = GalleryImage::factory()->hasAttached(LivingSpace::create(['name' => 'Kitchen']), relationship: 'spaces')->create();
    $image->options()->attach(collect($options)->pluck('id')->all());
    $image->addMedia(UploadedFile::fake()->image('kitchen.jpg'))->toMediaCollection('image');

    Livewire::test(EditGalleryImage::class, ['record' => $image->getRouteKey()])
        ->assertSchemaStateSet(['step_2_options' => [(string) $options[2]->id]])
        ->fillForm(['step_2_options' => [(string) $newStepTwoOption->id]])
        ->call('save')
        ->assertHasNoFormErrors();

    expect($image->options()->pluck('living_edit_options.id')->all())->toEqualCanonicalizing([
        $options[1]->id, $newStepTwoOption->id, $options[3]->id, $options[4]->id,
    ]);
});

test('syncing a step ignores options that belong to another step', function () {
    $stepOneOption = LivingEditOption::factory()->step(LivingEditStep::One)->create();
    $stepTwoOption = LivingEditOption::factory()->step(LivingEditStep::Two)->create();
    $image = GalleryImage::factory()->create();

    $image->syncStepOptions(LivingEditStep::One, [$stepOneOption->id, $stepTwoOption->id]);

    expect($image->options()->pluck('living_edit_options.id')->all())->toBe([$stepOneOption->id]);
});

test('the position column highlights the image position on a miniature board', function () {
    GalleryImage::factory()->slot(MoodBoardImageSlot::SmallMiddle)->create();

    Livewire::test(ListGalleryImages::class)
        ->assertSeeHtml('aria-label="Small middle position"')
        ->assertSeeHtml('title="Small middle · 3:4"')
        ->assertSeeHtmlInOrder([
            'class="mb-slot-mini__cell"',
            'class="mb-slot-mini__cell"',
            'class="mb-slot-mini__cell"',
            'class="mb-slot-mini__cell mb-slot-mini__cell--active"',
            'class="mb-slot-mini__cell"',
        ]);
});

test('position tabs list only the images of their position and count them', function () {
    $largeImages = GalleryImage::factory()->slot(MoodBoardImageSlot::Large)->count(2)->create();
    $smallImage = GalleryImage::factory()->slot(MoodBoardImageSlot::SmallLeft)->create();

    Livewire::test(ListGalleryImages::class)
        ->assertCanSeeTableRecords([...$largeImages, $smallImage])
        ->set('activeTab', 'large')
        ->assertCanSeeTableRecords($largeImages)
        ->assertCanNotSeeTableRecords([$smallImage])
        ->set('activeTab', 'small-left')
        ->assertCanSeeTableRecords([$smallImage])
        ->assertCanNotSeeTableRecords($largeImages);

    $tabs = Livewire::test(ListGalleryImages::class)->instance()->getTabs();

    expect(array_keys($tabs))->toBe(['all', 'large', 'top-right', 'small-left', 'small-middle', 'small-right'])
        ->and($tabs['all']->getBadge())->toBe('3')
        ->and($tabs['large']->getBadge())->toBe('2')
        ->and($tabs['top-right']->getBadge())->toBe('0');
});

test('the gallery filters by space and step option', function () {
    $kitchen = LivingSpace::create(['name' => 'Kitchen']);
    $bedroom = LivingSpace::create(['name' => 'Bedroom']);
    $warm = LivingEditOption::factory()->step(LivingEditStep::One)->create(['name' => 'Warm']);
    $calm = LivingEditOption::factory()->step(LivingEditStep::One)->create(['name' => 'Calm']);

    $warmKitchenLarge = GalleryImage::factory()->hasAttached($kitchen, relationship: 'spaces')->hasAttached($warm, relationship: 'options')->create();
    $calmBedroomSmall = GalleryImage::factory()->hasAttached($bedroom, relationship: 'spaces')->hasAttached($calm, relationship: 'options')->create();

    Livewire::test(ListGalleryImages::class)
        ->filterTable('spaces', [$bedroom->id])
        ->assertCanSeeTableRecords([$calmBedroomSmall])
        ->assertCanNotSeeTableRecords([$warmKitchenLarge])
        ->resetTableFilters()
        ->filterTable('step_1', [$warm->id])
        ->assertCanSeeTableRecords([$warmKitchenLarge])
        ->assertCanNotSeeTableRecords([$calmBedroomSmall]);
});

test('selected images can be deactivated in bulk', function () {
    $images = GalleryImage::factory()->count(2)->create();
    $untouched = GalleryImage::factory()->create();

    Livewire::test(ListGalleryImages::class)
        ->selectTableRecords($images)
        ->callAction(TestAction::make('deactivate')->table()->bulk());

    expect($images->fresh()->pluck('is_active')->all())->toBe([false, false])
        ->and($untouched->fresh()->is_active)->toBeTrue();
});

test('deleting an image removes its file', function () {
    Storage::fake('public');
    $image = GalleryImage::factory()->create();
    $media = $image->addMedia(UploadedFile::fake()->image('kitchen.jpg'))->toMediaCollection('image');

    Livewire::test(EditGalleryImage::class, ['record' => $image->getRouteKey()])
        ->callAction('delete');

    $this->assertModelMissing($image);
    $this->assertDatabaseMissing('media', ['id' => $media->id]);
    Storage::disk('public')->assertMissing($media->getPathRelativeToRoot());
});
