<?php

namespace App\Filament\Widgets;

use App\Enums\LivingEditStep;
use App\Filament\Support\ChartPalette;
use App\Models\LivingEditOption;
use Filament\Widgets\ChartWidget;

/**
 * The choices visitors get at each Living Edit step, live and hidden, so a
 * thin step is easy to spot.
 */
class LivingEditChoicesChart extends ChartWidget
{
    protected static ?int $sort = 8;

    protected ?string $heading = 'Living Edit choices';

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
        // Keyed "step:live", e.g. "2:1" for the live choices of step two.
        $counts = LivingEditOption::query()
            ->toBase()
            ->selectRaw('step, is_active, count(*) as total')
            ->groupBy('step', 'is_active')
            ->get()
            ->mapWithKeys(fn (object $row): array => [((int) $row->step).':'.((int) $row->is_active) => (int) $row->total]);

        $count = fn (LivingEditStep $step, bool $active): int => $counts->get($step->value.':'.((int) $active), 0);

        $steps = LivingEditStep::cases();

        return [
            'datasets' => [
                [
                    'label' => 'Live',
                    'data' => array_map(fn (LivingEditStep $step): int => $count($step, true), $steps),
                    'backgroundColor' => ChartPalette::SAGE,
                    'borderRadius' => 4,
                ],
                [
                    'label' => 'Hidden',
                    'data' => array_map(fn (LivingEditStep $step): int => $count($step, false), $steps),
                    'backgroundColor' => ChartPalette::STONE,
                    'borderRadius' => 4,
                ],
            ],
            'labels' => array_map(fn (LivingEditStep $step): string => $step->getLabel(), $steps),
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
}
