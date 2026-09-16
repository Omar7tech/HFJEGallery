<?php

namespace App\Filament\Resources\LivingSpaces\Pages;

use App\Filament\Resources\LivingSpaces\LivingSpaceResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListLivingSpaces extends ListRecords
{
    protected static string $resource = LivingSpaceResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
