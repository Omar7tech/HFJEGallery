<?php

namespace App\Filament\Resources\CurtainStyles\Pages;

use App\Filament\Resources\CurtainStyles\CurtainStyleResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListCurtainStyles extends ListRecords
{
    protected static string $resource = CurtainStyleResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
