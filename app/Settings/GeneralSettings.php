<?php

namespace App\Settings;

use Spatie\LaravelSettings\Settings;

class GeneralSettings extends Settings
{
    /**
     * Whether the studio phone number is shown on the site.
     */
    public bool $phone_number_enabled;

    /**
     * The number visitors can call.
     */
    public ?string $phone_number;

    /**
     * The studio email address shown on the site.
     */
    public ?string $email;

    /**
     * The social links shown in the site footer. Each entry is shaped
     * `['label' => string, 'url' => string]`.
     *
     * Note: no `@var` value type is declared because spatie/laravel-settings
     * cannot resolve a complex array-shape docblock here (it throws at runtime).
     */
    public array $social_links; // @phpstan-ignore missingType.iterableValue

    public static function group(): string
    {
        return 'general';
    }

    /**
     * The phone number to show, or null when it's switched off or unset.
     */
    public function usablePhoneNumber(): ?string
    {
        return $this->phone_number_enabled && filled($this->phone_number)
            ? $this->phone_number
            : null;
    }

    /**
     * The configured social links, in the saved order, dropping any entry
     * missing its name or URL.
     *
     * @return array<int, array{label: string, url: string}>
     */
    public function usableSocialLinks(): array
    {
        return collect($this->social_links)
            ->map(function (mixed $link): ?array {
                if (! is_array($link) || blank($link['label'] ?? null) || blank($link['url'] ?? null)) {
                    return null;
                }

                return [
                    'label' => (string) $link['label'],
                    'url' => (string) $link['url'],
                ];
            })
            ->filter()
            ->values()
            ->all();
    }
}
