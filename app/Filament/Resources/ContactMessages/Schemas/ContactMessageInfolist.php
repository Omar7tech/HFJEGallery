<?php

namespace App\Filament\Resources\ContactMessages\Schemas;

use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class ContactMessageInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('From')
                    ->columnSpanFull()
                    ->columns(2)
                    ->components([
                        TextEntry::make('name'),
                        TextEntry::make('topic')
                            ->badge(),
                        TextEntry::make('email')
                            ->url(fn (?string $state): ?string => $state ? "mailto:{$state}" : null)
                            ->copyable()
                            ->placeholder('-'),
                        TextEntry::make('phone')
                            ->url(fn (?string $state): ?string => $state ? 'tel:'.preg_replace('/[^\d+]/', '', $state) : null)
                            ->copyable()
                            ->placeholder('-'),
                        TextEntry::make('created_at')
                            ->label('Sent')
                            ->dateTime(),
                    ]),

                Section::make('Message')
                    ->columnSpanFull()
                    ->components([
                        TextEntry::make('message')
                            ->hiddenLabel()
                            ->prose(),
                    ]),
            ]);
    }
}
