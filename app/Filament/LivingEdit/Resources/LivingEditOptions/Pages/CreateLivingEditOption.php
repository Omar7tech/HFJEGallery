<?php

namespace App\Filament\LivingEdit\Resources\LivingEditOptions\Pages;

use App\Filament\LivingEdit\Resources\LivingEditOptions\LivingEditOptionResource;
use Filament\Resources\Pages\CreateRecord;

class CreateLivingEditOption extends CreateRecord
{
    protected static string $resource = LivingEditOptionResource::class;

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    protected function mutateFormDataBeforeCreate(array $data): array
    {
        return [...$data, 'step' => LivingEditOptionResource::getStep()];
    }
}
