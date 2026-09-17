<?php

namespace App\Filament\Resources\StepTwos\Pages;

use App\Filament\Resources\StepTwos\StepTwoResource;
use Filament\Actions\EditAction;
use Filament\Resources\Pages\ViewRecord;

class ViewStepTwo extends ViewRecord
{
    protected static string $resource = StepTwoResource::class;

    protected function getHeaderActions(): array
    {
        return [
            EditAction::make(),
        ];
    }
}
