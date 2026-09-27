<?php

namespace App\Filament\Resources\Projects\Schemas;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\SpatieMediaLibraryFileUpload;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Illuminate\Database\Eloquent\Builder;

class ProjectForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Details')
                    ->description('Everything shown on the project card and page.')
                    ->columnSpanFull()
                    ->columns(2)
                    ->components([
                        TextInput::make('name')
                            ->required()
                            ->maxLength(255)
                            ->unique(ignoreRecord: true),
                        Select::make('work_category_id')
                            ->label('Category')
                            ->relationship(
                                name: 'category',
                                titleAttribute: 'name',
                                modifyQueryUsing: fn (Builder $query): Builder => $query->orderBy('sort_order'),
                            )
                            ->required()
                            ->preload()
                            ->searchable(),
                        TextInput::make('location')
                            ->maxLength(255),
                        TextInput::make('year')
                            ->numeric()
                            ->minValue(1950)
                            ->maxValue(2100),
                        Textarea::make('summary')
                            ->maxLength(255)
                            ->rows(2)
                            ->helperText('One short line, shown under the project name.')
                            ->columnSpanFull(),
                        Textarea::make('description')
                            ->rows(6)
                            ->helperText('The story of the project. Leave an empty line between paragraphs.')
                            ->columnSpanFull(),
                    ]),

                Section::make('Cover')
                    ->description('The main photo, used on the card and at the top of the project page.')
                    ->columnSpanFull()
                    ->components([
                        SpatieMediaLibraryFileUpload::make('cover')
                            ->hiddenLabel()
                            ->collection('cover')
                            ->disk('public')
                            ->visibility('public')
                            ->image()
                            ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp'])
                            ->maxSize(10240)
                            ->conversion('thumb')
                            ->imageEditor()
                            ->helperText('JPG, PNG or WebP up to 10 MB, converted to WebP automatically.'),
                    ]),

                Section::make('Gallery')
                    ->description('Drag to reorder. The gallery follows this order on the site.')
                    ->columnSpanFull()
                    ->components([
                        SpatieMediaLibraryFileUpload::make('gallery')
                            ->hiddenLabel()
                            ->collection('gallery')
                            ->disk('public')
                            ->visibility('public')
                            ->multiple()
                            ->reorderable()
                            ->panelLayout('grid')
                            ->image()
                            ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp'])
                            ->maxSize(10240)
                            ->maxFiles(40)
                            ->conversion('thumb')
                            ->helperText('Up to 40 photos, converted to WebP automatically.'),
                    ]),
            ]);
    }
}
