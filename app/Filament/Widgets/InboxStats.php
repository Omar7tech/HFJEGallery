<?php

namespace App\Filament\Widgets;

use App\Enums\ContactTopic;
use App\Filament\Resources\ContactMessages\ContactMessageResource;
use App\Models\ContactMessage;
use Carbon\CarbonImmutable;
use Filament\Support\Icons\Heroicon;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

/**
 * The inbox at a glance: what is waiting, how enquiries compare with the
 * week and month before, and what people ask about most.
 */
class InboxStats extends StatsOverviewWidget
{
    protected static ?int $sort = 1;

    protected int|string|array $columnSpan = 'full';

    protected ?string $heading = 'Inbox';

    protected ?string $pollingInterval = '60s';

    /**
     * @return array<int, Stat>
     */
    protected function getStats(): array
    {
        $today = CarbonImmutable::today();

        return [
            $this->unread(),
            $this->thisWeek($today),
            $this->thisMonth($today),
            $this->topTopic($today),
        ];
    }

    private function unread(): Stat
    {
        $unread = ContactMessage::query()->whereNull('read_at')->count();
        $overdue = ContactMessage::query()
            ->whereNull('read_at')
            ->where('created_at', '<', now()->subDays(ContactMessage::OVERDUE_DAYS))
            ->count();

        $stat = Stat::make('Unread messages', $unread)
            ->icon(Heroicon::OutlinedInbox)
            ->url(ContactMessageResource::getUrl('index', ['filters' => ['read_at' => ['value' => '0']]]));

        return match (true) {
            $unread === 0 => $stat
                ->description('All caught up')
                ->descriptionIcon(Heroicon::CheckCircle)
                ->color('success'),
            $overdue > 0 => $stat
                ->description("{$overdue} waiting over ".ContactMessage::OVERDUE_DAYS.' days')
                ->descriptionIcon(Heroicon::ExclamationTriangle)
                ->color('danger'),
            default => $stat
                ->description('All from the last '.ContactMessage::OVERDUE_DAYS.' days')
                ->descriptionIcon(Heroicon::Clock)
                ->color('warning'),
        };
    }

    private function thisWeek(CarbonImmutable $today): Stat
    {
        $daily = $this->dailyCounts($today->subDays(13), $today);
        $current = array_sum(array_slice($daily, 7));
        $previous = array_sum(array_slice($daily, 0, 7));

        return $this->compared(
            Stat::make('Last 7 days', $current)->icon(Heroicon::OutlinedEnvelope),
            $current,
            $previous,
            'the week before',
        )->chart($daily);
    }

    private function thisMonth(CarbonImmutable $today): Stat
    {
        // The same number of days into last month, so a month in progress
        // is compared fairly.
        $current = $this->countBetween($today->startOfMonth(), $today->endOfDay());
        $lastMonth = $today->subMonthNoOverflow();
        $previous = $this->countBetween(
            $lastMonth->startOfMonth(),
            $lastMonth->startOfMonth()->addDays($today->day - 1)->endOfDay(),
        );

        return $this->compared(
            Stat::make($today->format('F').' so far', $current)->icon(Heroicon::OutlinedCalendarDays),
            $current,
            $previous,
            'this point last month',
        );
    }

    private function topTopic(CarbonImmutable $today): Stat
    {
        $counts = ContactMessage::query()
            ->where('created_at', '>=', $today->subDays(90))
            ->toBase()
            ->selectRaw('topic, count(*) as total')
            ->groupBy('topic')
            ->orderByDesc('total')
            ->pluck('total', 'topic');

        $top = $counts->keys()->first();

        if ($top === null) {
            return Stat::make('Most asked about', '-')
                ->description('No messages in the last 90 days')
                ->icon(Heroicon::OutlinedChatBubbleLeftRight);
        }

        $share = (int) round($counts->first() / max(1, $counts->sum()) * 100);

        return Stat::make('Most asked about', ContactTopic::from((string) $top)->getLabel())
            ->description("{$share}% of messages, last 90 days")
            ->icon(Heroicon::OutlinedChatBubbleLeftRight)
            ->color('primary');
    }

    private function compared(Stat $stat, int $current, int $previous, string $against): Stat
    {
        if ($current === $previous) {
            return $stat->description("Same as {$against}")->color('gray');
        }

        $change = $previous === 0
            ? "{$current} more than {$against}"
            : abs((int) round(($current - $previous) / $previous * 100)).'% '.($current > $previous ? 'up' : 'down')." on {$against}";

        return $stat
            ->description($change)
            ->descriptionIcon($current > $previous ? Heroicon::ArrowTrendingUp : Heroicon::ArrowTrendingDown)
            ->color($current > $previous ? 'success' : 'warning');
    }

    private function countBetween(CarbonImmutable $from, CarbonImmutable $to): int
    {
        return ContactMessage::query()->whereBetween('created_at', [$from, $to])->count();
    }

    /**
     * Messages per day from one date to another, both included.
     *
     * @return array<int, int>
     */
    private function dailyCounts(CarbonImmutable $from, CarbonImmutable $to): array
    {
        $counts = ContactMessage::query()
            ->whereBetween('created_at', [$from->startOfDay(), $to->endOfDay()])
            ->toBase()
            ->selectRaw('date(created_at) as day, count(*) as total')
            ->groupBy('day')
            ->pluck('total', 'day');

        $days = [];

        for ($day = $from; $day <= $to; $day = $day->addDay()) {
            $days[] = (int) ($counts[$day->toDateString()] ?? 0);
        }

        return $days;
    }
}
