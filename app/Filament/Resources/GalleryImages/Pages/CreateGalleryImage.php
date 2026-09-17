<?php

namespace App\Filament\Resources\GalleryImages\Pages;

use App\Filament\Resources\GalleryImages\GalleryImageResource;
use Filament\Resources\Pages\CreateRecord;

class CreateGalleryImage extends CreateRecord
{
    protected static string $resource = GalleryImageResource::class;

    protected static bool $canCreateAnother = true;

    /**
     * Uploads usually come in batches, so return to the gallery rather than the edit page.
     */
    protected function getRedirectUrl(): string
    {
        return $this->getResourceUrl('index');
    }
}
