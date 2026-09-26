<?php

namespace App\Filament\Resources\BayteCategories\Pages;

use App\Filament\Resources\BayteCategories\BayteCategoryResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditBayteCategory extends EditRecord
{
    protected static string $resource = BayteCategoryResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
