<?php

namespace App\Rules;

use App\Models\BayteProduct;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * Turning "Show on home page" on only fits while the home page's BAYTE
 * section has a free spot.
 */
class HomeHasRoomForBayteProduct implements ValidationRule
{
    /**
     * @param  BayteProduct|null  $product  The piece being edited, which never counts against itself.
     */
    public function __construct(private ?BayteProduct $product = null) {}

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! $value) {
            return;
        }

        $others = BayteProduct::query()
            ->where('is_on_home', true)
            ->when($this->product?->exists, fn ($query) => $query->whereKeyNot($this->product->getKey()))
            ->count();

        if ($others >= BayteProduct::HOME_LIMIT) {
            $fail('The home page already shows '.BayteProduct::HOME_LIMIT.' pieces. Turn one of them off first.');
        }
    }
}
