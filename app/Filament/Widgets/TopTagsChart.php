<?php

namespace App\Filament\Widgets;

use App\Filament\Support\ChartPalette;
use App\Models\WorkTag;
use Filament\Widgets\ChartWidget;

/**
 * The work tags used on the most projects: what the portfolio is known for.
 */
class TopTagsChart extends ChartWidget
{
    protected static ?int $sort = 6;

    protected ?string $heading = 'Most used tags';

    protected ?string $maxHeight = '260px';

    private const int LIMIT = 8;

    protected function getType(): string
    {
        return 'bar';
    }

    /**
     * @return array<string, mixed>
     */
    protected function getData(): array
    {
        $tags = WorkTag::query()
            ->whereHas('projects')
            ->withCount('projects')
            ->orderByDesc('projects_count')
            ->limit(self::LIMIT)
            ->get(['id', 'name']);

        return [
            'datasets' => [[
                'label' => 'Projects',
                'data' => $tags->pluck('projects_count')->all(),
                'backgroundColor' => ChartPalette::OLIVE,
                'borderRadius' => 4,
            ]],
            'labels' => $tags->pluck('name')->all(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    protected function getOptions(): array
    {
        return ChartPalette::horizontal();
    }
}
