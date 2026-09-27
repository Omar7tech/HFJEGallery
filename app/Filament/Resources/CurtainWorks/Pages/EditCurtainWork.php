<?php

namespace App\Filament\Resources\CurtainWorks\Pages;

use App\Filament\Resources\CurtainWorks\CurtainWorkResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditCurtainWork extends EditRecord
{
    protected static string $resource = CurtainWorkResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
