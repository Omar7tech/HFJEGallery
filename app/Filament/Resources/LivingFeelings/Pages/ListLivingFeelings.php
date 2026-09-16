<?php

namespace App\Filament\Resources\LivingFeelings\Pages;

use App\Filament\Resources\LivingFeelings\LivingFeelingResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListLivingFeelings extends ListRecords
{
    protected static string $resource = LivingFeelingResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
