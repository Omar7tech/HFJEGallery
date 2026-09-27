<?php

namespace App\Filament\Resources\WorkCategories\Pages;

use App\Filament\Resources\WorkCategories\WorkCategoryResource;
use Filament\Resources\Pages\CreateRecord;

class CreateWorkCategory extends CreateRecord
{
    protected static string $resource = WorkCategoryResource::class;
}
