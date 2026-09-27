<?php

namespace App\Filament\Resources\CurtainWorks\Pages;

use App\Filament\Resources\CurtainWorks\CurtainWorkResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListCurtainWorks extends ListRecords
{
    protected static string $resource = CurtainWorkResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
