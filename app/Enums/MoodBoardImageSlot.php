<?php

namespace App\Enums;

use Filament\Support\Contracts\HasDescription;
use Filament\Support\Contracts\HasLabel;

/**
 * The image positions on the Living Edit mood board, numbered in reading order.
 *
 * Aspect ratios match the rendered board (see resources/js/pages/living-edit/mood-board.tsx),
 * so uploads can be cropped to fit their slot without surprises.
 */
enum MoodBoardImageSlot: int implements HasDescription, HasLabel
{
    case Large = 1;
    case TopRight = 2;
    case SmallLeft = 3;
    case SmallMiddle = 4;
    case SmallRight = 5;

    public function getLabel(): string
    {
        return match ($this) {
            self::Large => 'Large',
            self::TopRight => 'Top right',
            self::SmallLeft => 'Small left',
            self::SmallMiddle => 'Small middle',
            self::SmallRight => 'Small right',
        };
    }

    public function getDescription(): string
    {
        return match ($this) {
            self::Large => 'Tall image filling the left side of the board.',
            self::TopRight => 'Square image at the top of the right side.',
            self::SmallLeft => 'First of the three small images at the bottom right.',
            self::SmallMiddle => 'Second of the three small images at the bottom right.',
            self::SmallRight => 'Last of the three small images at the bottom right.',
        };
    }

    /**
     * Width:height ratio of the slot, in the format Filament's image editor expects, e.g. "9:16".
     */
    public function aspectRatio(): string
    {
        return match ($this) {
            self::Large => '9:16',
            self::TopRight => '1:1',
            self::SmallLeft, self::SmallMiddle, self::SmallRight => '3:4',
        };
    }
}
