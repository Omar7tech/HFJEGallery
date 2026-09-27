<?php

namespace App\Filament\Resources\WorkTags\Pages;

use App\Filament\Resources\WorkTags\WorkTagResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditWorkTag extends EditRecord
{
    protected static string $resource = WorkTagResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
