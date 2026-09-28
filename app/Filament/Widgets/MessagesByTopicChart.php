<?php

namespace App\Filament\Widgets;

use App\Enums\ContactTopic;
use App\Models\ContactMessage;
use Filament\Widgets\ChartWidget;

/**
 * What people write about, as a share of all messages in a period.
 */
class MessagesByTopicChart extends ChartWidget
{
    protected static ?int $sort = 3;

    protected int|string|array $columnSpan = ['md' => 2, 'xl' => 1];

    protected ?string $heading = 'What people ask about';

    protected ?string $maxHeight = '280px';

    public ?string $filter = 'quarter';

    /**
     * @return array<string, string>
     */
    protected function getFilters(): array
    {
        return [
            'month' => 'Last 30 days',
            'quarter' => 'Last 90 days',
            'year' => 'Last 12 months',
            'all' => 'All time',
        ];
    }

    protected function getType(): string
    {
        return 'doughnut';
    }

    /**
     * @return array<string, mixed>
     */
    protected function getData(): array
    {
        // The filter comes from the browser, so only the known periods are used.
        $days = match ($this->filter) {
            'month' => 30,
            'year' => 365,
            'all' => null,
            default => 90,
        };

        $counts = ContactMessage::query()
            ->when($days, fn ($query) => $query->where('created_at', '>=', now()->subDays($days)))
            ->toBase()
            ->selectRaw('topic, count(*) as total')
            ->groupBy('topic')
            ->pluck('total', 'topic');

        $topics = ContactTopic::cases();

        return [
            'datasets' => [[
                'data' => array_map(fn (ContactTopic $topic): int => (int) ($counts[$topic->value] ?? 0), $topics),
                'backgroundColor' => array_map(fn (ContactTopic $topic): string => $topic->chartColor(), $topics),
                'borderWidth' => 0,
                'hoverOffset' => 6,
            ]],
            'labels' => array_map(fn (ContactTopic $topic): string => $topic->getLabel(), $topics),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    protected function getOptions(): array
    {
        return [
            'cutout' => '68%',
            'scales' => [
                'x' => ['display' => false],
                'y' => ['display' => false],
            ],
            'plugins' => [
                'legend' => ['position' => 'bottom', 'labels' => ['usePointStyle' => true, 'boxWidth' => 8]],
            ],
        ];
    }
}
