<?php

namespace App\Filament\Resources\LivingEditOptions\Pages;

use App\Filament\Resources\LivingEditOptions\LivingEditOptionResource;
use Filament\Actions\EditAction;
use Filament\Resources\Pages\ViewRecord;

class ViewLivingEditOption extends ViewRecord
{
    protected static string $resource = LivingEditOptionResource::class;

    protected function getHeaderActions(): array
    {
        return [
            EditAction::make(),
        ];
    }
}
