<?php

namespace App\Filament\Resources\BayteProducts\Schemas;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\SpatieMediaLibraryFileUpload;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Illuminate\Database\Eloquent\Builder;

class BayteProductForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Details')
                    ->description('Everything shown on the product card.')
                    ->columnSpanFull()
                    ->columns(2)
                    ->components([
                        TextInput::make('name')
                            ->required()
                            ->maxLength(255)
                            ->unique(ignoreRecord: true),
                        Select::make('bayte_category_id')
                            ->label('Category')
                            ->relationship(
                                name: 'category',
                                titleAttribute: 'name',
                                modifyQueryUsing: fn (Builder $query): Builder => $query->orderBy('sort_order'),
                            )
                            ->required()
                            ->preload()
                            ->searchable(),
                        Textarea::make('description')
                            ->required()
                            ->maxLength(255)
                            ->rows(2)
                            ->helperText('One short line, shown under the name.')
                            ->columnSpanFull(),
                    ]),

                Section::make('Image')
                    ->description('A cutout on a transparent background works best.')
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
                            ->conversion('webp')
                            ->imageEditor()
                            ->imageEditorAspectRatioOptions(['3:2', null])
                            ->helperText('PNG or WebP up to 10 MB, converted to WebP automatically. Pieces without an image fall back to the placeholder.'),
                    ]),
            ]);
    }
}
