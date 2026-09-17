<?php

namespace App\Filament\Resources\StepThrees\Pages;

use App\Filament\Resources\StepThrees\StepThreeResource;
use Filament\Actions\EditAction;
use Filament\Resources\Pages\ViewRecord;

class ViewStepThree extends ViewRecord
{
    protected static string $resource = StepThreeResource::class;

    protected function getHeaderActions(): array
    {
        return [
            EditAction::make(),
        ];
    }
}
