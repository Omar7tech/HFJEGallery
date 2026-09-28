<?php

namespace App\Filament\Resources\ContactMessages\Pages;

use App\Filament\Resources\ContactMessages\ContactMessageResource;
use App\Models\ContactMessage;
use Filament\Actions\Action;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\ViewRecord;
use Filament\Support\Icons\Heroicon;

class ViewContactMessage extends ViewRecord
{
    protected static string $resource = ContactMessageResource::class;

    /**
     * Opening a message marks it read.
     */
    public function mount(int|string $record): void
    {
        parent::mount($record);

        $message = $this->getRecord();

        if ($message instanceof ContactMessage) {
            $message->markAsRead();
        }
    }

    protected function getHeaderActions(): array
    {
        return [
            // Leaves the message flagged for later and goes back to the inbox.
            Action::make('markAsUnread')
                ->label('Mark as unread')
                ->icon(Heroicon::OutlinedEnvelope)
                ->color('gray')
                ->action(function (ContactMessage $record): void {
                    $record->markAsUnread();
                    $this->redirect(ContactMessageResource::getUrl('index'));
                }),
            DeleteAction::make(),
        ];
    }
}
