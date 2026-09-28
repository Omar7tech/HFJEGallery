<?php

namespace App\Models;

use App\Enums\ContactTopic;
use Carbon\CarbonImmutable;
use Database\Factories\ContactMessageFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * A message a visitor sent from the contact page, read in the dashboard.
 *
 * @property ContactTopic $topic
 * @property CarbonImmutable|null $read_at
 * @property CarbonImmutable $created_at
 */
#[Fillable(['topic', 'name', 'email', 'phone', 'message'])]
class ContactMessage extends Model
{
    /** @use HasFactory<ContactMessageFactory> */
    use HasFactory;

    /** Unread for longer than this, a message is overdue for a reply. */
    public const int OVERDUE_DAYS = 2;

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'topic' => ContactTopic::class,
            'read_at' => 'datetime',
        ];
    }

    public function isUnread(): bool
    {
        return $this->read_at === null;
    }

    public function markAsRead(): void
    {
        if ($this->isUnread()) {
            $this->forceFill(['read_at' => now()])->save();
        }
    }

    public function markAsUnread(): void
    {
        $this->forceFill(['read_at' => null])->save();
    }
}
