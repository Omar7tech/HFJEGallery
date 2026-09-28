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
}
