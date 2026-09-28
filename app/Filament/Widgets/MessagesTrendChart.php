<?php

namespace App\Filament\Widgets;

use App\Enums\ContactTopic;
use App\Models\ContactMessage;
use Carbon\CarbonImmutable;
use Filament\Widgets\ChartWidget;

/**
 * Messages over time, stacked by what they were about, so a busy week can be
 * traced back to curtains, BAYTÉ or a new interiors enquiry.
 */
class MessagesTrendChart extends ChartWidget
{
    protected static ?int $sort = 2;

    protected int|string|array $columnSpan = ['md' => 2, 'xl' => 2];

    protected ?string $heading = 'Messages over time';

    protected ?string $maxHeight = '280px';

    public ?string $filter = 'weeks';

    /**
     * @return array<string, string>
     */
    protected function getFilters(): array
    {
        return [
            'days' => 'Last 30 days',
            'weeks' => 'Last 12 weeks',
            'months' => 'Last 12 months',
        ];
    }

    public function getDescription(): ?string
    {
        return 'Stacked by what each message was about.';
    }

    protected function getType(): string
    {
        return 'bar';
    }

    /**
     * @return array<string, mixed>
     */
    protected function getData(): array
    {
        $buckets = $this->buckets();
        $first = $buckets[0]['from'];

        $messages = ContactMessage::query()
            ->where('created_at', '>=', $first)
            ->get(['topic', 'created_at']);

        $datasets = [];

        foreach (ContactTopic::cases() as $topic) {
            $datasets[] = [
                'label' => $topic->getLabel(),
                'data' => array_map(
                    fn (array $bucket): int => $messages
                        ->filter(fn (ContactMessage $message): bool => $message->topic === $topic
                            && $message->created_at >= $bucket['from']
                            && $message->created_at < $bucket['to'])
                        ->count(),
                    $buckets,
                ),
                'backgroundColor' => $topic->chartColor(),
                'borderRadius' => 4,
                'maxBarThickness' => 28,
            ];
        }

        return [
            'datasets' => $datasets,
            'labels' => array_column($buckets, 'label'),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    protected function getOptions(): array
    {
        return [
            'scales' => [
                'x' => ['stacked' => true, 'grid' => ['display' => false]],
                'y' => ['stacked' => true, 'beginAtZero' => true, 'ticks' => ['precision' => 0]],
            ],
            'plugins' => [
                'legend' => ['position' => 'bottom', 'labels' => ['usePointStyle' => true, 'boxWidth' => 8]],
            ],
        ];
    }

    /**
     * The periods along the axis, oldest first.
     *
     * @return array<int, array{from: CarbonImmutable, to: CarbonImmutable, label: string}>
     */
    private function buckets(): array
    {
        $today = CarbonImmutable::today();

        // The filter comes from the browser; anything unexpected falls back to weeks.
        return match ($this->filter) {
            'days' => array_map(fn (int $ago): array => [
                'from' => $today->subDays($ago),
                'to' => $today->subDays($ago - 1),
                'label' => $today->subDays($ago)->format('j M'),
            ], range(29, 0)),
            'months' => array_map(fn (int $ago): array => [
                'from' => $today->startOfMonth()->subMonthsNoOverflow($ago),
                'to' => $today->startOfMonth()->subMonthsNoOverflow($ago - 1),
                'label' => $today->startOfMonth()->subMonthsNoOverflow($ago)->format('M y'),
            ], range(11, 0)),
            default => array_map(fn (int $ago): array => [
                'from' => $today->startOfWeek()->subWeeks($ago),
                'to' => $today->startOfWeek()->subWeeks($ago - 1),
                'label' => $today->startOfWeek()->subWeeks($ago)->format('j M'),
            ], range(11, 0)),
        };
    }
}
