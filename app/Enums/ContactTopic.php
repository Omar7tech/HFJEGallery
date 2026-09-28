<?php

namespace App\Enums;

use Filament\Support\Contracts\HasLabel;

/**
 * What a visitor is writing to the studio about, picked on the contact page.
 */
enum ContactTopic: string implements HasLabel
{
    case Interiors = 'interiors';
    case Curtains = 'curtains';
    case Bayte = 'bayte';
    case LivingEdit = 'living-edit';
    case Other = 'other';

    public function getLabel(): string
    {
        return match ($this) {
            self::Interiors => 'Interiors',
            self::Curtains => 'Curtains & Textiles',
            self::Bayte => 'BAYTÉ',
            self::LivingEdit => 'The Living Edit',
            self::Other => 'Something else',
        };
    }

    /**
     * The topic's colour in the dashboard charts, built around the studio's
     * terracotta so a topic reads the same in every chart.
     */
    public function chartColor(): string
    {
        return match ($this) {
            self::Interiors => '#a65e3c',
            self::Curtains => '#d69a6f',
            self::Bayte => '#5f6f52',
            self::LivingEdit => '#8a9a7b',
            self::Other => '#b8aea3',
        };
    }
}
