<?php

namespace App\Filament\Resources\StepThrees\Pages;

use App\Filament\Resources\StepThrees\StepThreeResource;
use Filament\Actions\DeleteAction;
use Filament\Actions\ViewAction;
use Filament\Resources\Pages\EditRecord;

class EditStepThree extends EditRecord
{
    protected static string $resource = StepThreeResource::class;

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
