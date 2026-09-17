<?php

namespace App\Filament\Resources\GalleryImages\Pages;

use App\Enums\MoodBoardImageSlot;
use App\Filament\Resources\GalleryImages\GalleryImageResource;
use App\Models\GalleryImage;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;
use Filament\Schemas\Components\Tabs\Tab;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class ListGalleryImages extends ListRecords
{
    protected static string $resource = GalleryImageResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make()
                ->label('Add image'),
        ];
    }

    /**
     * One tab per mood board position, keyed by a readable slug so it can live in the URL.
     *
     * @return array<string, Tab>
     */
    public function getTabs(): array
    {
        $counts = $this->countImagesPerSlot();

        return [
            'all' => Tab::make('All')
                ->badge($counts->sum()),
            ...collect(MoodBoardImageSlot::cases())
                ->mapWithKeys(fn (MoodBoardImageSlot $slot): array => [
                    Str::kebab($slot->name) => Tab::make($slot->getLabel())
                        ->badge($counts->get($slot->value, 0))
                        ->modifyQueryUsing(fn (Builder $query): Builder => $query->where('slot', $slot)),
                ])
                ->all(),
        ];
    }

    /**
     * Counts every position in a single query instead of one query per tab.
     *
     * @return Collection<int, int>
     */
    protected function countImagesPerSlot(): Collection
    {
        return GalleryImage::query()
            ->toBase()
            ->selectRaw('slot, count(*) as aggregate')
            ->groupBy('slot')
            ->pluck('aggregate', 'slot')
            ->map(fn (mixed $count): int => (int) $count);
    }
}
