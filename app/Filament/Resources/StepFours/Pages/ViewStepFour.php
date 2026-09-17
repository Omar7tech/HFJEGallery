<?php

namespace App\Filament\Resources\StepFours\Pages;

use App\Filament\Resources\StepFours\StepFourResource;
use Filament\Actions\EditAction;
use Filament\Resources\Pages\ViewRecord;

class ViewStepFour extends ViewRecord
{
    protected static string $resource = StepFourResource::class;

    protected function getHeaderActions(): array
    {
        return [
            EditAction::make(),
        ];
    }
}
