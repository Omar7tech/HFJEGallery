<?php

namespace App\Filament\Resources\WorkCategories\Schemas;

use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\SpatieMediaLibraryFileUpload;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class WorkCategoryForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Details')
                    ->description('Shown on the category card of the Work page.')
                    ->columnSpanFull()
                    ->components([
                        TextInput::make('name')
                            ->required()
                            ->maxLength(255)
                            ->unique(ignoreRecord: true),
                        Textarea::make('description')
                            ->maxLength(255)
                            ->rows(2)
                            ->helperText('One or two short lines under the category name.'),
                    ]),

                Section::make('Tags')
                    ->description('Sub-categories to filter this category by (Villas, Duplexes…). Pick them on each project; a project can have several. Tags without projects stay hidden on the site.')
                    ->columnSpanFull()
                    ->components([
                        Repeater::make('tags')
                            ->hiddenLabel()
                            ->relationship()
                            ->orderColumn('sort_order')
                            ->schema([
                                TextInput::make('name')
                                    ->hiddenLabel()
                                    ->required()
                                    ->maxLength(255)
                                    ->distinct(),
                            ])
                            ->grid(3)
                            ->addActionLabel('Add tag')
                            ->defaultItems(0),
                    ]),

                Section::make('Image')
                    ->description('A wide interior photo works best.')
                    ->columnSpanFull()
                    ->components([
                        SpatieMediaLibraryFileUpload::make('image')
                            ->hiddenLabel()
                            ->collection('image')
                            ->disk('public')
                            ->visibility('public')
                            ->image()
                            ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp'])
                            ->maxSize(10240)
                            ->conversion('thumb')
                            ->imageEditor()
                            ->helperText('JPG, PNG or WebP up to 10 MB, converted to WebP automatically. Categories without an image show a placeholder.'),
                    ]),
            ]);
    }
}
