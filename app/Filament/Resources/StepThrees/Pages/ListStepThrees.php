<?php

namespace App\Filament\Resources\StepThrees\Pages;

use App\Filament\Resources\StepThrees\StepThreeResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListStepThrees extends ListRecords
{
    protected static string $resource = StepThreeResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
