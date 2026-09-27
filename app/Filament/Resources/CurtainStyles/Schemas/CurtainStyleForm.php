<?php

namespace App\Filament\Resources\CurtainStyles\Schemas;

use Filament\Forms\Components\SpatieMediaLibraryFileUpload;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class CurtainStyleForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Details')
                    ->description('The first 8 active styles fill "Designed for Every Window" on the Curtains page; every active one is listed on the styles page.')
                    ->columnSpanFull()
                    ->columns(2)
                    ->components([
                        TextInput::make('name')
                            ->required()
                            ->maxLength(255)
                            ->unique(ignoreRecord: true),
                        Toggle::make('is_active')
                            ->label('Active')
                            ->default(true)
                            ->inline(false),
                        Textarea::make('description')
                            ->required()
                            ->maxLength(255)
                            ->rows(2)
                            ->helperText('One short line, shown under the name.')
                            ->columnSpanFull(),
                    ]),

                Section::make('Image')
                    ->description('A tall photo of the curtain in a room works best.')
                    ->columnSpanFull()
                    ->components([
                        SpatieMediaLibraryFileUpload::make('image')
                            ->hiddenLabel()
                            ->collection('image')
                            ->disk('public')
                            ->visibility('public')
                            ->required()
                            ->image()
                            ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp'])
                            ->maxSize(10240)
                            ->conversion('thumb')
                            ->imageEditor()
                            ->helperText('JPG, PNG or WebP up to 10 MB, converted to WebP automatically.'),
                    ]),
            ]);
    }
}
