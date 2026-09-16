<?php

namespace App\Filament\Resources\LivingSpaces\Pages;

use App\Filament\Resources\LivingSpaces\LivingSpaceResource;
use Filament\Actions\EditAction;
use Filament\Resources\Pages\ViewRecord;

class ViewLivingSpace extends ViewRecord
{
    protected static string $resource = LivingSpaceResource::class;

    protected function getHeaderActions(): array
    {
        return [
            EditAction::make(),
        ];
    }
}
