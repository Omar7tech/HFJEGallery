<?php

namespace App\Filament\Resources\ContactMessages\Tables;

use App\Enums\ContactTopic;
use App\Models\ContactMessage;
use Filament\Actions\Action;
use Filament\Actions\BulkAction;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\ViewAction;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

class ContactMessagesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->defaultSort('created_at', 'desc')
            // Unread rows are washed green; see resources/css/filament/contact-messages.css.
            ->recordClasses(fn (ContactMessage $record): ?string => $record->isUnread() ? 'contact-message-unread' : null)
            ->columns([
                TextColumn::make('name')
                    ->searchable()
                    // Unread messages stand out in bold.
                    ->weight(fn (ContactMessage $record): string => $record->isUnread() ? 'bold' : 'normal')
                    ->description(fn (ContactMessage $record): ?string => $record->phone),
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
                Action::make('markAsRead')
                    ->label('Mark as read')
                    ->icon(Heroicon::OutlinedEnvelopeOpen)
                    ->color('success')
                    ->visible(fn (ContactMessage $record): bool => $record->isUnread())
                    ->action(fn (ContactMessage $record) => $record->markAsRead()),
                Action::make('markAsUnread')
                    ->label('Mark as unread')
                    ->icon(Heroicon::OutlinedEnvelope)
                    ->color('gray')
                    ->hidden(fn (ContactMessage $record): bool => $record->isUnread())
                    ->action(fn (ContactMessage $record) => $record->markAsUnread()),
                ViewAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    BulkAction::make('markAsRead')
                        ->label('Mark as read')
                        ->icon(Heroicon::OutlinedEnvelopeOpen)
                        ->action(fn (Collection $records) => ContactMessage::query()
                            ->whereKey($records->modelKeys())
                            ->whereNull('read_at')
                            ->update(['read_at' => now()]))
                        ->deselectRecordsAfterCompletion(),
                    BulkAction::make('markAsUnread')
                        ->label('Mark as unread')
                        ->icon(Heroicon::OutlinedEnvelope)
                        ->action(fn (Collection $records) => ContactMessage::query()
                            ->whereKey($records->modelKeys())
                            ->update(['read_at' => null]))
                        ->deselectRecordsAfterCompletion(),
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
