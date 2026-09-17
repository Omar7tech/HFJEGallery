<?php

namespace App\Http\Requests;

use App\Enums\LivingEditStep;
use Illuminate\Foundation\Http\FormRequest;

/**
 * The visitor's Living Edit choices, using the same query string keys as the Living Edit page.
 */
class MoodBoardRequest extends FormRequest
{
    public const int MAX_SELECTIONS_PER_STEP = 3;

    public const int SLUG_MAX_LENGTH = 100;

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        $slugList = '/^[a-z0-9]+(?:-[a-z0-9]+)*(?:,[a-z0-9]+(?:-[a-z0-9]+)*){0,'.(self::MAX_SELECTIONS_PER_STEP - 1).'}$/';

        return [
            'space' => ['required', 'string', 'max:'.self::SLUG_MAX_LENGTH, 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/'],
            ...collect(LivingEditStep::cases())
                ->mapWithKeys(fn (LivingEditStep $step): array => [
                    static::stepKey($step) => ['nullable', 'string', 'max:'.(self::MAX_SELECTIONS_PER_STEP * (self::SLUG_MAX_LENGTH + 1)), "regex:{$slugList}"],
                ])
                ->all(),
            'seed' => ['nullable', 'integer', 'min:0', 'max:2147483647'],
            'keep' => ['nullable', 'array', 'max:5'],
            'keep.*' => ['integer', 'min:1'],
        ];
    }

    /**
     * The query string key of a step, e.g. "step1".
     */
    public static function stepKey(LivingEditStep $step): string
    {
        return "step{$step->value}";
    }

    /**
     * The option slugs chosen in a step, without duplicates.
     *
     * @return list<string>
     */
    public function selectedSlugs(LivingEditStep $step): array
    {
        $value = $this->validated(static::stepKey($step));

        return is_string($value) ? array_values(array_unique(explode(',', $value))) : [];
    }

    public function seed(): int
    {
        return (int) $this->validated('seed', 0);
    }

    /**
     * Ids of the images currently on the visitor's board, kept when they still match best.
     *
     * @return list<int>
     */
    public function keptImageIds(): array
    {
        return array_values(array_map(intval(...), $this->validated('keep', [])));
    }
}
