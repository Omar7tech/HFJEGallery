<?php

namespace App\Filament\Widgets;

use App\Filament\Resources\ContactMessages\ContactMessageResource;
use App\Models\ContactMessage;
use Filament\Actions\Action;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget;

/**
 * The newest messages, unread ones washed green as in the inbox.
 */
class LatestMessages extends TableWidget
{
    protected static ?int $sort = 4;

    protected int|string|array $columnSpan = 'full';

    protected static ?string $heading = 'Latest messages';

    public function table(Table $table): Table
    {
        return $table
            ->query(ContactMessage::query()->latest()->limit(6))
            ->paginated(false)
            ->recordClasses(fn (ContactMessage $record): ?string => $record->isUnread() ? 'contact-message-unread' : null)
            ->recordUrl(fn (ContactMessage $record): string => ContactMessageResource::getUrl('view', ['record' => $record]))
            ->columns([
                TextColumn::make('name')
                    ->weight(fn (ContactMessage $record): string => $record->isUnread() ? 'bold' : 'normal')
                    ->description(fn (ContactMessage $record): ?string => $record->phone),
                TextColumn::make('topic')
                    ->badge(),
                TextColumn::make('message')
                    ->limit(70)
                    ->color('gray'),
                TextColumn::make('created_at')
                    ->label('Sent')
                    ->since(),
            ])
            ->headerActions([
                Action::make('inbox')
                    ->label('Open inbox')
                    ->link()
                    ->url(ContactMessageResource::getUrl('index')),
            ])
            ->emptyStateHeading('No messages yet')
            ->emptyStateDescription('Messages sent from the contact page will appear here.');
    }
}
