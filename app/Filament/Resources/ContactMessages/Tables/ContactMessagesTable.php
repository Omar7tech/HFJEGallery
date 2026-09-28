<?php

namespace App\Filament\Resources\ContactMessages\Tables;

use App\Enums\ContactTopic;
use App\Models\ContactMessage;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class ContactMessagesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->defaultSort('created_at', 'desc')
            ->columns([
                TextColumn::make('name')
                    ->searchable()
                    // Unread messages stand out in bold.
                    ->weight(fn (ContactMessage $record): string => $record->read_at === null ? 'bold' : 'normal')
                    ->description(fn (ContactMessage $record): ?string => $record->email ?? $record->phone),
                TextColumn::make('topic')
                    ->badge(),
                TextColumn::make('message')
                    ->limit(60)
                    ->searchable()
                    ->color('gray'),
                TextColumn::make('created_at')
                    ->label('Sent')
                    ->since()
                    ->sortable(),
            ])
            ->filters([
                SelectFilter::make('topic')
                    ->options(ContactTopic::class),
                TernaryFilter::make('read_at')
                    ->label('Read')
                    ->nullable()
                    ->trueLabel('Read')
                    ->falseLabel('Unread')
                    ->queries(
                        true: fn (Builder $query): Builder => $query->whereNotNull('read_at'),
                        false: fn (Builder $query): Builder => $query->whereNull('read_at'),
                    ),
            ])
            ->recordActions([
                ViewAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
