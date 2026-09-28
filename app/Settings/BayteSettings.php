<?php

namespace App\Settings;

use Spatie\LaravelSettings\Settings;

class BayteSettings extends Settings
{
    /**
     * The WhatsApp number visitors send their selection of pieces to.
     */
    public ?string $whatsapp_number;

    public static function group(): string
    {
        return 'bayte';
    }

    /**
     * The WhatsApp number reduced to the digits wa.me accepts (no `+`, spaces
     * or dashes), or null when none is set.
     */
    public function whatsappDigits(): ?string
    {
        $digits = preg_replace('/\D/', '', (string) $this->whatsapp_number);

        return $digits !== '' ? $digits : null;
    }
}
