<?php

namespace App\Filament\Resources\LivingSpaces\Schemas;

use Filament\Infolists\Components\IconEntry;
use Filament\Infolists\Components\SpatieMediaLibraryImageEntry;
use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class LivingSpaceInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Details')
                    ->columnSpanFull()
                    ->columns(3)
                    ->components([
                        TextEntry::make('name'),
                        TextEntry::make('slug')
                            ->copyable(),
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

                Section::make('Feelings')
                    ->columnSpanFull()
                    ->components([
                        TextEntry::make('feelings.name')
                            ->hiddenLabel()
                            ->badge()
                            ->placeholder('No feelings linked.'),
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
