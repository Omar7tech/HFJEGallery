<?php

namespace App\Filament\Resources\StepThrees\Schemas;

use Filament\Infolists\Components\IconEntry;
use Filament\Infolists\Components\SpatieMediaLibraryImageEntry;
use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class StepThreeInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Details')
                    ->columnSpanFull()
                    ->columns(2)
                    ->components([
                        TextEntry::make('name'),
                        IconEntry::make('is_active')
                            ->label('Active')
                            ->boolean(),
                    ]),

                Section::make('Icon')
                    ->columnSpanFull()
                    ->components([
                        SpatieMediaLibraryImageEntry::make('icon')
                            ->hiddenLabel()
                            ->collection('icon')
                            ->conversion('webp')
                            ->imageHeight(64)
                            ->placeholder('-'),
                    ]),

                Section::make('Meta')
                    ->columnSpanFull()
                    ->columns(2)
                    ->collapsed()
                    ->components([
                        TextEntry::make('created_at')
                            ->dateTime()
                            ->placeholder('-'),
                        TextEntry::make('updated_at')
                            ->dateTime()
                            ->placeholder('-'),
                    ]),
            ]);
    }
}
