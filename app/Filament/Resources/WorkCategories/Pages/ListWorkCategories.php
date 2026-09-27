<?php

namespace App\Filament\Resources\WorkCategories\Pages;

use App\Filament\Resources\WorkCategories\WorkCategoryResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListWorkCategories extends ListRecords
{
    protected static string $resource = WorkCategoryResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
