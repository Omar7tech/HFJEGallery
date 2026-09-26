<?php

namespace App\Filament\Resources\BayteCategories\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class BayteCategoryForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('name')
                    ->required()
                    ->maxLength(255)
                    ->unique(ignoreRecord: true)
                    ->helperText('Shown as a filter pill on the BAYTE page.')
                    ->columnSpanFull(),
            ]);
    }
}
