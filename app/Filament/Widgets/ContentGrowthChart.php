<?php

namespace App\Filament\Widgets;

use App\Filament\Support\ChartPalette;
use App\Models\BayteProduct;
use App\Models\CurtainWork;
use App\Models\Project;
use Carbon\CarbonImmutable;
use Filament\Widgets\ChartWidget;
use Illuminate\Database\Eloquent\Model;

/**
 * How the site has grown: the running total of projects, BAYTÉ pieces and
 * curtain projects at the end of each month.
 */
class ContentGrowthChart extends ChartWidget
{
    protected static ?int $sort = 2;

    protected int|string|array $columnSpan = ['md' => 2, 'xl' => 2];

    protected ?string $heading = 'How the site has grown';

    protected ?string $maxHeight = '280px';

    public ?string $filter = 'year';

    /**
     * @return array<string, string>
     */
    protected function getFilters(): array
    {
        return [
            'half' => 'Last 6 months',
            'year' => 'Last 12 months',
            'two-years' => 'Last 24 months',
        ];
    }

    public function getDescription(): ?string
    {
        return 'Everything on the site at the end of each month.';
    }

    protected function getType(): string
    {
        return 'line';
    }

    /**
     * @return array<string, mixed>
     */
    protected function getData(): array
    {
        $months = match ($this->filter) {
            'half' => 6,
            'two-years' => 24,
            default => 12,
        };

        $ends = array_map(
            fn (int $ago): CarbonImmutable => CarbonImmutable::today()->subMonthsNoOverflow($ago)->endOfMonth(),
            range($months - 1, 0),
        );

        $series = [
            'Projects' => [Project::class, ChartPalette::TERRACOTTA],
            'BAYTÉ pieces' => [BayteProduct::class, ChartPalette::OLIVE],
            'Curtain projects' => [CurtainWork::class, ChartPalette::SAND],
        ];

        $datasets = [];

        foreach ($series as $label => [$model, $color]) {
            $datasets[] = [
                'label' => $label,
                'data' => $this->runningTotals($model, $ends),
                'borderColor' => $color,
                'backgroundColor' => $color,
                'pointRadius' => 2,
                'tension' => 0.35,
            ];
        }

        return [
            'datasets' => $datasets,
            'labels' => array_map(fn (CarbonImmutable $end): string => $end->format('M y'), $ends),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    protected function getOptions(): array
    {
        return ChartPalette::options();
    }

    /**
     * How many existed at each month's end, from one query per model.
     *
     * @param  class-string<Model>  $model
     * @param  array<int, CarbonImmutable>  $ends
     * @return array<int, int>
     */
    private function runningTotals(string $model, array $ends): array
    {
        $created = $model::query()->pluck('created_at')->sort()->values();

        return array_map(
            fn (CarbonImmutable $end): int => $created->filter(fn ($at): bool => $at <= $end)->count(),
            $ends,
        );
    }
}
