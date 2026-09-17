<?php

namespace App\Filament\Resources\StepFours\Pages;

use App\Filament\Resources\StepFours\StepFourResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListStepFours extends ListRecords
{
    protected static string $resource = StepFourResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
