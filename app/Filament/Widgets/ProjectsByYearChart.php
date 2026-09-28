<?php

namespace App\Filament\Widgets;

use App\Filament\Support\ChartPalette;
use App\Models\CurtainWork;
use App\Models\Project;
use Filament\Widgets\ChartWidget;

/**
 * The portfolio as a timeline: interiors and curtain projects by the year
 * they were completed.
 */
class ProjectsByYearChart extends ChartWidget
{
    protected static ?int $sort = 9;

    protected ?string $heading = 'Projects by year';

    protected ?string $maxHeight = '260px';

    public function getDescription(): ?string
    {
        return 'By the year set on each project.';
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
        $interiors = $this->perYear(Project::class);
        $curtains = $this->perYear(CurtainWork::class);

        $years = array_unique([...array_keys($interiors), ...array_keys($curtains)]);
        sort($years);

        return [
            'datasets' => [
                [
                    'label' => 'Interiors',
                    'data' => array_map(fn (int $year): int => $interiors[$year] ?? 0, $years),
                    'backgroundColor' => ChartPalette::TERRACOTTA,
                    'borderRadius' => 4,
                ],
                [
                    'label' => 'Curtains',
                    'data' => array_map(fn (int $year): int => $curtains[$year] ?? 0, $years),
                    'backgroundColor' => ChartPalette::SAND,
                    'borderRadius' => 4,
                ],
            ],
            'labels' => array_map('strval', $years),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    protected function getOptions(): array
    {
        return ChartPalette::options([
            'scales' => ['x' => ['stacked' => true], 'y' => ['stacked' => true]],
        ]);
    }

    /**
     * @param  class-string<Project|CurtainWork>  $model
     * @return array<int, int>
     */
    private function perYear(string $model): array
    {
        return $model::query()
            ->whereNotNull('year')
            ->toBase()
            ->selectRaw('year, count(*) as total')
            ->groupBy('year')
            ->pluck('total', 'year')
            ->mapWithKeys(fn (mixed $total, mixed $year): array => [(int) $year => (int) $total])
            ->all();
    }
}
