<?php

namespace App\Filament\Support;

/**
 * The dashboard chart colours: the studio's terracotta, then warm and
 * green companions, so every chart reads as one family.
 */
class ChartPalette
{
    public const string TERRACOTTA = '#a65e3c';

    public const string SAND = '#d69a6f';

    public const string OLIVE = '#5f6f52';

    public const string SAGE = '#8a9a7b';

    public const string STONE = '#b8aea3';

    public const string INK = '#3b3430';

    public const string SUCCESS = '#4d7c5b';

    /** @var list<string> */
    public const array SERIES = [self::TERRACOTTA, self::OLIVE, self::SAND, self::SAGE, self::STONE, self::INK];

    /**
     * A colour for the nth series, wrapping round when there are more.
     */
    public static function nth(int $index): string
    {
        return self::SERIES[$index % count(self::SERIES)];
    }

    /**
     * Shared Chart.js options: no clutter, whole numbers, legend at the foot.
     *
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    public static function options(array $overrides = []): array
    {
        return array_replace_recursive([
            'scales' => [
                'x' => ['grid' => ['display' => false]],
                'y' => ['beginAtZero' => true, 'ticks' => ['precision' => 0]],
            ],
            'plugins' => [
                'legend' => ['position' => 'bottom', 'labels' => ['usePointStyle' => true, 'boxWidth' => 8]],
            ],
        ], $overrides);
    }

    /**
     * Options for a horizontal bar chart with no legend.
     *
     * @return array<string, mixed>
     */
    public static function horizontal(): array
    {
        return [
            'indexAxis' => 'y',
            'scales' => [
                'x' => ['beginAtZero' => true, 'ticks' => ['precision' => 0]],
                'y' => ['grid' => ['display' => false]],
            ],
            'plugins' => ['legend' => ['display' => false]],
        ];
    }
}
