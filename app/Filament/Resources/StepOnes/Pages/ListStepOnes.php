<?php

namespace App\Filament\Resources\StepOnes\Pages;

use App\Filament\Resources\StepOnes\StepOneResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListStepOnes extends ListRecords
{
    protected static string $resource = StepOneResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
