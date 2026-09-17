<?php

namespace App\Filament\Forms\Components;

use App\Enums\MoodBoardImageSlot;
use BackedEnum;
use Filament\Forms\Components\Field;
use Illuminate\Validation\Rule;

/**
 * Picks a mood board position by clicking it on a miniature of the board shown on the website.
 */
class MoodBoardSlotPicker extends Field
{
    protected string $view = 'filament.forms.components.mood-board-slot-picker';

    protected function setUp(): void
    {
        parent::setUp();

        $this->afterStateHydrated(function (MoodBoardSlotPicker $component, mixed $state): void {
            $component->state($state instanceof BackedEnum ? $state->value : $state);
        });

        $this->rule(Rule::enum(MoodBoardImageSlot::class));
    }

    /**
     * The details the view needs for every slot, keyed by slot value.
     *
     * @return array<int, array{label: string, description: string, aspectRatio: string}>
     */
    public function getSlots(): array
    {
        return collect(MoodBoardImageSlot::cases())
            ->mapWithKeys(fn (MoodBoardImageSlot $slot): array => [$slot->value => [
                'label' => $slot->getLabel(),
                'description' => $slot->getDescription(),
                'aspectRatio' => $slot->aspectRatio(),
            ]])
            ->all();
    }
}
