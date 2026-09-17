<?php

namespace App\Filament\LivingEdit\Resources\LivingEditOptions\Pages;

use App\Filament\LivingEdit\Resources\LivingEditOptions\LivingEditOptionResource;
use Filament\Actions\DeleteAction;
use Filament\Actions\ViewAction;
use Filament\Resources\Pages\EditRecord;

class EditLivingEditOption extends EditRecord
{
    protected static string $resource = LivingEditOptionResource::class;

    protected function getHeaderActions(): array
    {
        return [
            ViewAction::make(),
            DeleteAction::make(),
        ];
    }

    /**
     * Renaming regenerates the slug used in the URL, so reload the page on its new address.
     */
    protected function getRedirectUrl(): ?string
    {
        if ($this->getRecord()->wasChanged('slug')) {
            return $this->getResourceUrl('edit');
        }

        return parent::getRedirectUrl();
    }
}
