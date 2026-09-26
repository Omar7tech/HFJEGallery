<?php

namespace App\Filament\Resources\BayteCategories\Pages;

use App\Filament\Resources\BayteCategories\BayteCategoryResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListBayteCategories extends ListRecords
{
    protected static string $resource = BayteCategoryResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
