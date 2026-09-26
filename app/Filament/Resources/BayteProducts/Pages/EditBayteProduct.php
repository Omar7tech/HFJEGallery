<?php

namespace App\Filament\Resources\BayteProducts\Pages;

use App\Filament\Resources\BayteProducts\BayteProductResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditBayteProduct extends EditRecord
{
    protected static string $resource = BayteProductResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
