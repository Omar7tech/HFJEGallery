<?php

namespace App\Filament\LivingEdit\Resources\LivingEditOptions\Pages;

use App\Filament\LivingEdit\Resources\LivingEditOptions\LivingEditOptionResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListLivingEditOptions extends ListRecords
{
    protected static string $resource = LivingEditOptionResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
