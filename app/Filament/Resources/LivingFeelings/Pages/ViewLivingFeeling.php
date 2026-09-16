<?php

namespace App\Filament\Resources\LivingFeelings\Pages;

use App\Filament\Resources\LivingFeelings\LivingFeelingResource;
use Filament\Actions\EditAction;
use Filament\Resources\Pages\ViewRecord;

class ViewLivingFeeling extends ViewRecord
{
    protected static string $resource = LivingFeelingResource::class;

    protected function getHeaderActions(): array
    {
        return [
            EditAction::make(),
        ];
    }
}
