<?php

namespace App\Filament\Widgets;

use App\Filament\Support\ChartPalette;
use App\Models\WorkCategory;
use Filament\Widgets\ChartWidget;

/**
 * How the portfolio is spread across the work categories.
 */
class ProjectsByCategoryChart extends ChartWidget
{
    protected static ?int $sort = 8;

    protected ?string $heading = 'Projects by category';

    protected ?string $maxHeight = '260px';

    protected function getType(): string
    {
        return 'bar';
    }

    /**
     * @return array<string, mixed>
     */
    protected function getData(): array
    {
        $categories = WorkCategory::query()
            ->withCount('projects')
            ->orderByDesc('projects_count')
            ->get(['id', 'name']);

        return [
            'datasets' => [[
                'label' => 'Projects',
                'data' => $categories->pluck('projects_count')->all(),
                'backgroundColor' => ChartPalette::TERRACOTTA,
                'borderRadius' => 4,
            ]],
            'labels' => $categories->pluck('name')->all(),
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
