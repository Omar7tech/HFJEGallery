<?php

namespace App\Filament\Resources\StepTwos\Pages;

use App\Filament\Resources\StepTwos\StepTwoResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListStepTwos extends ListRecords
{
    protected static string $resource = StepTwoResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
