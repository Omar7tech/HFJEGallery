<?php

namespace App\Filament\Tables\Columns;

use App\Enums\MoodBoardImageSlot;
use BackedEnum;
use Filament\Tables\Columns\Column;

/**
 * Shows a mood board position as a miniature of the board with that position highlighted.
 */
class MoodBoardSlotColumn extends Column
{
    protected string $view = 'filament.tables.columns.mood-board-slot-column';

    public function getSlot(): ?MoodBoardImageSlot
    {
        $state = $this->getState();

        if ($state instanceof MoodBoardImageSlot) {
            return $state;
        }

        return MoodBoardImageSlot::tryFrom((int) ($state instanceof BackedEnum ? $state->value : $state));
    }
}
