<?php

namespace App\Filament\Resources\CurtainStyles\Pages;

use App\Filament\Resources\CurtainStyles\CurtainStyleResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditCurtainStyle extends EditRecord
{
    protected static string $resource = CurtainStyleResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
