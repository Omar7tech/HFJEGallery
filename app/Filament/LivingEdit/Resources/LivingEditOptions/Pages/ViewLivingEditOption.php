<?php

namespace App\Filament\LivingEdit\Resources\LivingEditOptions\Pages;

use App\Filament\LivingEdit\Resources\LivingEditOptions\LivingEditOptionResource;
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
