<?php

namespace App\Filament\Resources\BayteProducts\Pages;

use App\Filament\Resources\BayteProducts\BayteProductResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListBayteProducts extends ListRecords
{
    protected static string $resource = BayteProductResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
