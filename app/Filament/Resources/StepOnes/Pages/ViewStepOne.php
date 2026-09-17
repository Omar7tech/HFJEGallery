<?php

namespace App\Filament\Resources\StepOnes\Pages;

use App\Filament\Resources\StepOnes\StepOneResource;
use Filament\Actions\EditAction;
use Filament\Resources\Pages\ViewRecord;

class ViewStepOne extends ViewRecord
{
    protected static string $resource = StepOneResource::class;

    protected function getHeaderActions(): array
    {
        return [
            EditAction::make(),
        ];
    }
}
