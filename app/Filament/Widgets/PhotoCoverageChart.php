<?php

namespace App\Filament\Widgets;

use App\Filament\Support\ChartPalette;
use App\Models\BayteProduct;
use App\Models\CurtainStyle;
use App\Models\CurtainWork;
use App\Models\Project;
use App\Models\WorkCategory;
use Filament\Widgets\ChartWidget;
use Illuminate\Database\Eloquent\Builder;

/**
 * The share of each part of the site that has its photo. Anything short of
 * 100% shows a placeholder somewhere; the "Needs attention" list says where.
 */
class PhotoCoverageChart extends ChartWidget
{
    protected static ?int $sort = 7;

    protected int|string|array $columnSpan = ['md' => 2, 'xl' => 1];

    protected ?string $heading = 'Photo coverage';

    protected ?string $maxHeight = '280px';

    public function getDescription(): ?string
    {
        return 'Share of each section with its photos in place.';
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
        $coverage = [
            'Project covers' => $this->share(Project::query(), 'cover'),
            'Project galleries' => $this->share(Project::query(), 'gallery'),
            'BAYTÉ pieces' => $this->share(BayteProduct::query(), 'image'),
            'Curtain projects' => $this->share(CurtainWork::query(), 'cover'),
            'Curtain styles' => $this->share(CurtainStyle::query()->where('is_active', true), 'image'),
            'Work categories' => $this->share(WorkCategory::query(), 'image'),
        ];

        return [
            'datasets' => [[
                'label' => '% with photos',
                'data' => array_values($coverage),
                // Complete sections go green; the rest stay terracotta.
                'backgroundColor' => array_map(
                    fn (int $share): string => $share === 100 ? ChartPalette::SUCCESS : ChartPalette::TERRACOTTA,
                    array_values($coverage),
                ),
                'borderRadius' => 4,
            ]],
            'labels' => array_keys($coverage),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    protected function getOptions(): array
    {
        return array_replace_recursive(ChartPalette::horizontal(), [
            'scales' => ['x' => ['max' => 100]],
        ]);
    }

    /**
     * The percentage of records that have media in the collection; an empty
     * section counts as complete.
     *
     * @param  Builder<*>  $query
     */
    private function share(Builder $query, string $collection): int
    {
        $total = (clone $query)->count();

        if ($total === 0) {
            return 100;
        }

        $withPhoto = $query->whereHas('media', fn (Builder $media) => $media->where('collection_name', $collection))->count();

        return (int) round($withPhoto / $total * 100);
    }
}
