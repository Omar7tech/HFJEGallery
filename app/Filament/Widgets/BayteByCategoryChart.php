<?php

namespace App\Filament\Widgets;

use App\Filament\Support\ChartPalette;
use App\Models\BayteCategory;
use Filament\Widgets\ChartWidget;
use Illuminate\Database\Eloquent\Builder;

/**
 * The BAYTÉ collection by category, split into pieces that have their photo
 * and pieces still showing the placeholder.
 */
class BayteByCategoryChart extends ChartWidget
{
    protected static ?int $sort = 11;

    protected int|string|array $columnSpan = ['md' => 2, 'xl' => 2];

    protected ?string $heading = 'BAYTÉ collection';

    protected ?string $maxHeight = '260px';

    public function getDescription(): ?string
    {
        return 'Pieces in each category, and how many still need a photo.';
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
        $withPhoto = fn (Builder $pieces) => $pieces->whereHas('media', fn (Builder $media) => $media->where('collection_name', 'image'));

        $categories = BayteCategory::query()
            ->orderBy('sort_order')
            ->orderBy('id')
            ->withCount([
                'products',
                'products as with_photo_count' => $withPhoto,
            ])
            ->get(['id', 'name']);

        return [
            'datasets' => [
                [
                    'label' => 'With photo',
                    'data' => $categories->pluck('with_photo_count')->all(),
                    'backgroundColor' => ChartPalette::OLIVE,
                    'borderRadius' => 4,
                ],
                [
                    'label' => 'Needs a photo',
                    'data' => $categories
                        ->map(fn (BayteCategory $category): int => (int) $category->getAttribute('products_count') - (int) $category->getAttribute('with_photo_count'))
                        ->all(),
                    'backgroundColor' => ChartPalette::STONE,
                    'borderRadius' => 4,
                ],
            ],
            'labels' => $categories->pluck('name')->all(),
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
