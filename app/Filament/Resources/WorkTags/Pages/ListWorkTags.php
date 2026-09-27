<?php

namespace App\Filament\Resources\WorkTags\Pages;

use App\Filament\Resources\WorkTags\WorkTagResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListWorkTags extends ListRecords
{
    protected static string $resource = WorkTagResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
