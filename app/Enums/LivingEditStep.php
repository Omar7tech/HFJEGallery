<?php

namespace App\Enums;

use BackedEnum;
use Filament\Support\Contracts\HasIcon;
use Filament\Support\Contracts\HasLabel;
use Filament\Support\Icons\Heroicon;

enum LivingEditStep: int implements HasIcon, HasLabel
{
    case One = 1;
    case Two = 2;
    case Three = 3;
    case Four = 4;

    public function getLabel(): string
    {
        return "Step {$this->value}";
    }

    public function getIcon(): BackedEnum
    {
        return match ($this) {
            self::One => Heroicon::OutlinedSwatch,
            self::Two => Heroicon::OutlinedSparkles,
            self::Three => Heroicon::OutlinedCube,
            self::Four => Heroicon::OutlinedPaintBrush,
        };
    }

    /**
     * Identifies the step in the dashboard configuration and on the frontend, e.g. "step-1".
     */
    public function key(): string
    {
        return "step-{$this->value}";
    }
}
