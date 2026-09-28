<?php

namespace App\Filament\Widgets;

use App\Filament\Resources\BayteProducts\BayteProductResource;
use App\Filament\Resources\CurtainWorks\CurtainWorkResource;
use App\Filament\Resources\LivingSpaces\LivingSpaceResource;
use App\Filament\Resources\Projects\ProjectResource;
use App\Filament\Resources\WorkTags\WorkTagResource;
use App\Models\BayteCategory;
use App\Models\BayteProduct;
use App\Models\CurtainStyle;
use App\Models\CurtainWork;
use App\Models\GalleryImage;
use App\Models\LivingEditOption;
use App\Models\LivingSpace;
use App\Models\Project;
use App\Models\WorkCategory;
use App\Models\WorkTag;
use Filament\Support\Icons\Heroicon;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Number;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * What the site is showing: each part of it in one number, with what it is
 * made of underneath and how much was added lately.
 */
class CatalogueStats extends StatsOverviewWidget
{
    protected static ?int $sort = 5;

    protected int|string|array $columnSpan = 'full';

    protected ?string $heading = 'On the site';

    /**
     * @return array<int, Stat>
     */
    protected function getStats(): array
    {
        $onHome = BayteProduct::query()->where('is_on_home', true)->count();

        return [
            Stat::make('Projects', Project::count())
                ->description($this->recently(Project::class).' in '.WorkCategory::count().' categories')
                ->icon(Heroicon::OutlinedPhoto)
                ->url(ProjectResource::getUrl('index')),

            Stat::make('BAYTÉ pieces', BayteProduct::count())
                ->description(BayteCategory::count().' categories · '.($onHome > 0
                    ? "{$onHome} picked for the home page"
                    : 'home page shows the first '.BayteProduct::HOME_LIMIT))
                ->icon(Heroicon::OutlinedSquares2x2)
                ->url(BayteProductResource::getUrl('index')),

            Stat::make('Curtain projects', CurtainWork::count())
                ->description(CurtainStyle::query()->where('is_active', true)->count().' styles live · '.$this->recently(CurtainWork::class))
                ->icon(Heroicon::OutlinedSwatch)
                ->url(CurtainWorkResource::getUrl('index')),

            Stat::make('Living Edit', LivingSpace::query()->where('is_active', true)->count().' spaces')
                ->description(LivingEditOption::query()->where('is_active', true)->count().' choices · '.GalleryImage::query()->where('is_active', true)->count().' mood board images')
                ->icon(Heroicon::OutlinedSparkles)
                ->url(LivingSpaceResource::getUrl('index')),

            Stat::make('Photo library', Number::format(Media::count()).' files')
                ->description(Number::fileSize((int) Media::query()->sum('size'), precision: 1).' of photos and images')
                ->icon(Heroicon::OutlinedPhoto),

            Stat::make('Work tags', WorkTag::count())
                ->description(WorkTag::query()->has('projects')->count().' in use on projects')
                ->icon(Heroicon::OutlinedTag)
                ->url(WorkTagResource::getUrl('index')),
        ];
    }

    /**
     * "3 new this month", or "none new this month".
     *
     * @param  class-string<Model>  $model
     */
    private function recently(string $model): string
    {
        $count = $model::query()->where('created_at', '>=', now()->startOfMonth())->count();

        return ($count > 0 ? "{$count} new" : 'none new').' this month';
    }
}
