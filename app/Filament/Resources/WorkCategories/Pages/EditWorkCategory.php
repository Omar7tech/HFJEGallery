<?php

namespace App\Filament\Resources\WorkCategories\Pages;

use App\Filament\Resources\WorkCategories\WorkCategoryResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditWorkCategory extends EditRecord
{
    protected static string $resource = WorkCategoryResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
