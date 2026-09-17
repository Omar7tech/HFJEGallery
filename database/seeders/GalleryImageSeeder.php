<?php

namespace Database\Seeders;

use App\Enums\LivingEditStep;
use App\Enums\MoodBoardImageSlot;
use App\Models\GalleryImage;
use App\Models\LivingEditOption;
use App\Models\LivingSpace;
use GdImage;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Random\Engine\Xoshiro256StarStar;
use Random\Randomizer;
use RuntimeException;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * Local demo data: placeholder mood board images spread over every space and position,
 * tagged with options from every step. Needs the spaces and options from LivingEditSeeder.
 */
class GalleryImageSeeder extends Seeder
{
    /** Demo images are recognised by this file name prefix, so the seeder never duplicates them. */
    public const string FILE_NAME_PREFIX = 'demo-gallery-';

    /** Interior palette hues: clay, terracotta, sand, mustard, olive, sage, slate and blush. */
    private const array INTERIOR_HUES = [8, 18, 32, 44, 70, 110, 205, 340];

    /** Images created for every space and position pair. */
    public int $imagesPerSpaceAndSlot = 10;

    /** Seed for the random choices, so every run produces the same data. */
    public int $randomSeed = 2026;

    private Randomizer $randomizer;

    public function run(): void
    {
        if (Media::query()->where('file_name', 'like', self::FILE_NAME_PREFIX.'%')->exists()) {
            $this->command->warn('Demo gallery images already exist, skipping.');

            return;
        }

        $spaces = LivingSpace::query()->orderBy('sort_order')->get();
        $optionsByStep = LivingEditOption::query()->orderBy('sort_order')->get()
            ->groupBy(fn (LivingEditOption $option): int => $option->step->value);

        if ($spaces->isEmpty() || $optionsByStep->count() < count(LivingEditStep::cases())) {
            throw new RuntimeException('Seed spaces and options for every step first (LivingEditSeeder).');
        }

        $this->randomizer = new Randomizer(new Xoshiro256StarStar($this->randomSeed));
        $number = 0;

        foreach ($spaces as $space) {
            foreach (MoodBoardImageSlot::cases() as $slot) {
                for ($index = 0; $index < $this->imagesPerSpaceAndSlot; $index++) {
                    $this->createImage(++$number, $index, $space, $spaces, $slot, $optionsByStep);
                }
            }
        }

        $this->command->info("Created {$number} demo gallery images.");
    }

    /**
     * @param  Collection<int, LivingSpace>  $spaces
     * @param  \Illuminate\Support\Collection<int, Collection<int, LivingEditOption>>  $optionsByStep
     */
    private function createImage(int $number, int $index, LivingSpace $space, Collection $spaces, MoodBoardImageSlot $slot, \Illuminate\Support\Collection $optionsByStep): void
    {
        $selectedOptions = collect(LivingEditStep::cases())
            ->mapWithKeys(fn (LivingEditStep $step): array => [
                $step->value => $this->pickOptions($optionsByStep->get($step->value), $index),
            ]);

        $extraSpaces = $this->shuffled($spaces->except($space->getKey()))
            ->take($this->randomizer->getInt(1, 100) <= 25 ? 1 : 0);

        $leadOption = $selectedOptions->get(LivingEditStep::One->value)->first();

        $image = GalleryImage::create([
            'slot' => $slot,
            'alt_text' => Str::ucfirst("{$leadOption->name} {$space->name}, {$slot->getLabel()} image"),
            'is_active' => $this->randomizer->getInt(1, 100) > 8,
        ]);

        $image->spaces()->attach([$space->getKey(), ...$extraSpaces->modelKeys()]);
        $image->options()->attach($selectedOptions->flatten()->pluck('id')->all());

        $image->addMedia($this->drawPlaceholder($slot, $leadOption->name, "{$space->name} - {$slot->getLabel()} - #{$number}"))
            ->usingFileName(self::FILE_NAME_PREFIX.$number.'.jpg')
            ->toMediaCollection('image');
    }

    /**
     * One to three options of a step. The first one rotates through all options, so every option
     * is used across the images of each space and position.
     *
     * @param  Collection<int, LivingEditOption>  $options
     * @return Collection<int, LivingEditOption>
     */
    private function pickOptions(Collection $options, int $index): Collection
    {
        $rotated = $options->values()->get($index % $options->count());

        return $this->shuffled($options->except($rotated->getKey()))
            ->take($this->randomizer->getInt(0, 2))
            ->prepend($rotated)
            ->values();
    }

    /**
     * Shuffles with the seeded randomizer, so the result is the same on every run.
     *
     * @template TModel of \Illuminate\Database\Eloquent\Model
     *
     * @param  Collection<int, TModel>  $items
     * @return Collection<int, TModel>
     */
    private function shuffled(Collection $items): Collection
    {
        return $items->sortBy(fn (): int => $this->randomizer->nextInt())->values();
    }

    /**
     * Draws a JPG in the shape of the slot: a soft gradient tinted by the lead option,
     * simple room shapes and a caption. Returns the path of a temporary file.
     */
    private function drawPlaceholder(MoodBoardImageSlot $slot, string $tint, string $caption): string
    {
        [$width, $height] = match ($slot) {
            MoodBoardImageSlot::Large => [900, 1600],
            MoodBoardImageSlot::TopRight => [1200, 1200],
            MoodBoardImageSlot::SmallLeft, MoodBoardImageSlot::SmallMiddle, MoodBoardImageSlot::SmallRight => [900, 1200],
        };

        $hue = self::INTERIOR_HUES[crc32(Str::lower($tint)) % count(self::INTERIOR_HUES)] + $this->randomizer->getInt(0, 10);
        $canvas = imagecreatetruecolor($width, $height);

        for ($y = 0; $y < $height; $y++) {
            $lightness = 0.82 - 0.32 * ($y / $height);
            imageline($canvas, 0, $y, $width, $y, $this->color($canvas, $hue, 0.28, $lightness));
        }

        imagefilledrectangle(
            $canvas,
            (int) ($width * 0.12), (int) ($height * 0.1),
            (int) ($width * 0.52), (int) ($height * 0.42),
            $this->color($canvas, $hue, 0.18, 0.92, 40),
        );

        imagefilledrectangle(
            $canvas,
            0, (int) ($height * 0.78),
            $width, $height,
            $this->color($canvas, ($hue + 20) % 360, 0.3, 0.38, 20),
        );

        imagefilledellipse(
            $canvas,
            (int) ($width * $this->randomizer->getFloat(0.55, 0.8)), (int) ($height * 0.68),
            (int) ($width * 0.46), (int) ($height * 0.22),
            $this->color($canvas, ($hue + 180) % 360, 0.22, 0.45, 35),
        );

        imagefilledrectangle(
            $canvas,
            (int) ($width * 0.08), (int) ($height * 0.6),
            (int) ($width * 0.4), (int) ($height * 0.8),
            $this->color($canvas, ($hue + 30) % 360, 0.35, 0.3, 30),
        );

        imagestring($canvas, 5, 24, $height - 36, $caption, $this->color($canvas, 0, 0, 1));

        $path = sys_get_temp_dir().DIRECTORY_SEPARATOR.self::FILE_NAME_PREFIX.Str::random(16).'.jpg';
        imagejpeg($canvas, $path, 85);
        imagedestroy($canvas);

        return $path;
    }

    /**
     * Allocates an HSL colour, with alpha from 0 (opaque) to 127 (transparent).
     *
     * @param  int<0, 127>  $alpha
     */
    private function color(GdImage $canvas, int $hue, float $saturation, float $lightness, int $alpha = 0): int
    {
        $chroma = (1 - abs(2 * $lightness - 1)) * $saturation;
        $segment = $hue / 60;
        $second = $chroma * (1 - abs(fmod($segment, 2) - 1));

        [$red, $green, $blue] = match (true) {
            $segment < 1 => [$chroma, $second, 0],
            $segment < 2 => [$second, $chroma, 0],
            $segment < 3 => [0, $chroma, $second],
            $segment < 4 => [0, $second, $chroma],
            $segment < 5 => [$second, 0, $chroma],
            default => [$chroma, 0, $second],
        };

        $offset = $lightness - $chroma / 2;
        $channel = fn (float $value): int => max(0, min(255, (int) round(($value + $offset) * 255)));

        $color = imagecolorallocatealpha($canvas, $channel($red), $channel($green), $channel($blue), $alpha);

        if ($color === false) {
            throw new RuntimeException('Could not allocate a colour for the placeholder image.');
        }

        return $color;
    }
}
