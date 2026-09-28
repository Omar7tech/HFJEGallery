<?php

namespace App\Filament\Widgets;

use App\Filament\Resources\BayteProducts\BayteProductResource;
use App\Filament\Resources\ContactMessages\ContactMessageResource;
use App\Filament\Resources\Projects\ProjectResource;
use App\Models\ContactMessage;
use Carbon\CarbonImmutable;
use Filament\Widgets\Widget;

/**
 * The top of the dashboard: a greeting for the time of day in Beirut, one
 * sentence on how the studio stands, the few things done most often, and the
 * living room from the home page, in daylight or lamplight to match the hour.
 */
class Welcome extends Widget
{
    /** The studio's clock, whatever the server runs on. */
    public const string STUDIO_TIMEZONE = 'Asia/Beirut';

    protected static ?int $sort = 0;

    protected static bool $isLazy = false;

    protected int|string|array $columnSpan = 'full';

    protected string $view = 'filament.widgets.welcome';

    /**
     * @return array<string, mixed>
     */
    protected function getViewData(): array
    {
        $now = CarbonImmutable::now(self::STUDIO_TIMEZONE);
        $user = filament()->auth()->user();
        $unread = ContactMessage::query()->whereNull('read_at')->count();
        $issues = count(NeedsAttention::issues());

        return [
            'greeting' => match (true) {
                $now->hour >= 5 && $now->hour < 12 => 'Good morning',
                $now->hour >= 12 && $now->hour < 18 => 'Good afternoon',
                default => 'Good evening',
            },
            'firstName' => $user ? strtok(filament()->getUserName($user), ' ') : null,
            'date' => $now->format('l, j F'),
            'status' => $this->status($unread, $issues),
            'unread' => $unread,
            // Lamplight from six in the evening to six in the morning.
            'isNight' => $now->hour >= 18 || $now->hour < 6,
            'links' => [
                'project' => ProjectResource::getUrl('create'),
                'piece' => BayteProductResource::getUrl('create'),
                'inbox' => ContactMessageResource::getUrl('index'),
                'site' => url('/'),
            ],
        ];
    }

    /**
     * One plain sentence on what is waiting.
     */
    private function status(int $unread, int $issues): string
    {
        $messages = $unread === 1 ? '1 unread message' : "{$unread} unread messages";
        $fixes = $issues === 1 ? '1 thing to fix on the site' : "{$issues} things to fix on the site";

        return match (true) {
            $unread === 0 && $issues === 0 => 'The inbox is clear and nothing on the site needs fixing.',
            $issues === 0 => "You have {$messages}. Everything on the site looks good.",
            $unread === 0 => "The inbox is clear. There are {$fixes}.",
            default => "You have {$messages} and {$fixes}.",
        };
    }
}
