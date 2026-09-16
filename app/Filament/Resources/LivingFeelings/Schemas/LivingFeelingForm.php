<?php

namespace App\Filament\Resources\LivingFeelings\Schemas;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\SpatieMediaLibraryFileUpload;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Illuminate\Database\Eloquent\Builder;

class LivingFeelingForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Details')
                    ->description('Basic information about the feeling.')
                    ->columnSpanFull()
                    ->columns(2)
                    ->components([
                        TextInput::make('name')
                            ->required()
                            ->maxLength(255)
                            ->unique(),
                        Toggle::make('is_active')
                            ->label('Active')
                            ->default(true)
                            ->inline(false),
                    ]),

                Section::make('Icon')
                    ->description('Icon shown on the moodboard.')
                    ->columnSpanFull()
                    ->components([
                        SpatieMediaLibraryFileUpload::make('icon')
                            ->hiddenLabel()
                            ->collection('icon')
                            ->disk('public')
                            ->visibility('public')
                            ->image()
                            ->acceptedFileTypes(['image/png', 'image/webp'])
                            ->maxSize(1024)
                            ->conversion('webp')
                            ->imageEditor()
                            ->imageEditorAspectRatioOptions(['1:1'])
                            ->helperText('Square PNG or WebP with a transparent background.'),
                    ]),

                Section::make('Spaces')
                    ->description('Spaces this feeling is offered in.')
                    ->columnSpanFull()
                    ->components([
                        Select::make('spaces')
                            ->hiddenLabel()
                            ->relationship(
                                titleAttribute: 'name',
                                modifyQueryUsing: fn (Builder $query): Builder => $query->orderBy('sort_order'),
                            )
                            ->multiple()
                            ->searchable()
                            ->placeholder('Search spaces to add')
                            ->searchPrompt('Type to search spaces')
                            ->noSearchResultsMessage('No spaces found.'),
                    ]),
            ]);
    }
}
