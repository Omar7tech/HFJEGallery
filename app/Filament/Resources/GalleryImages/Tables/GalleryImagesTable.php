<?php

namespace App\Filament\Resources\GalleryImages\Tables;

use App\Enums\LivingEditStep;
use App\Enums\MoodBoardImageSlot;
use App\Models\GalleryImage;
use Filament\Actions\BulkAction;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Support\Enums\TextSize;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\Layout\Stack;
use Filament\Tables\Columns\SpatieMediaLibraryImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Enums\FiltersLayout;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

class GalleryImagesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(fn (Builder $query): Builder => $query->with(['media', 'spaces', 'options']))
            ->defaultSort('created_at', 'desc')
            ->contentGrid(['md' => 2, 'xl' => 3, '2xl' => 4])
            ->paginationPageOptions([12, 24, 48])
            ->defaultPaginationPageOption(24)
            ->columns([
                Stack::make([
                    SpatieMediaLibraryImageColumn::make('image')
                        ->collection('image')
                        ->conversion('thumb')
                        ->imageWidth('100%')
                        ->imageHeight('14rem')
                        ->extraImgAttributes(fn (GalleryImage $record): array => [
                            'alt' => $record->alt_text ?? '',
                            'loading' => 'lazy',
                            'style' => 'width: 100%; object-fit: cover; border-radius: 0.5rem;',
                        ]),
                    TextColumn::make('slot')
                        ->badge()
                        ->color('primary'),
                    TextColumn::make('status')
                        ->state(fn (GalleryImage $record): ?string => $record->is_active ? null : 'Inactive')
                        ->badge()
                        ->color('danger'),
                    TextColumn::make('spaces.name')
                        ->badge()
                        ->color('gray')
                        ->limitList(3)
                        ->expandableLimitedList(),
                    TextColumn::make('options.name')
                        ->badge()
                        ->color('gray')
                        ->limitList(4)
                        ->expandableLimitedList(),
                    TextColumn::make('alt_text')
                        ->searchable()
                        ->color('gray')
                        ->size(TextSize::Small)
                        ->limit(80),
                ])->space(2),
            ])
            ->filters([
                SelectFilter::make('slot')
                    ->label('Position')
                    ->options(MoodBoardImageSlot::class)
                    ->multiple(),
                SelectFilter::make('spaces')
                    ->relationship('spaces', 'name', fn (Builder $query): Builder => $query->orderBy('sort_order'))
                    ->multiple()
                    ->preload(),
                ...array_map(
                    fn (LivingEditStep $step): SelectFilter => SelectFilter::make("step_{$step->value}")
                        ->label($step->getLabel())
                        ->relationship('options', 'name', fn (Builder $query): Builder => $query->where('step', $step)->orderBy('sort_order'))
                        ->multiple()
                        ->preload(),
                    LivingEditStep::cases(),
                ),
                TernaryFilter::make('is_active')
                    ->label('Active'),
            ], layout: FiltersLayout::AboveContentCollapsible)
            ->filtersFormColumns(['md' => 2, 'xl' => 4])
            ->deferFilters(false)
            ->persistFiltersInSession()
            ->recordActions([
                EditAction::make(),
                DeleteAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    BulkAction::make('activate')
                        ->icon(Heroicon::OutlinedEye)
                        ->action(fn (Collection $records): int => $records->toQuery()->update(['is_active' => true]))
                        ->deselectRecordsAfterCompletion(),
                    BulkAction::make('deactivate')
                        ->icon(Heroicon::OutlinedEyeSlash)
                        ->action(fn (Collection $records): int => $records->toQuery()->update(['is_active' => false]))
                        ->deselectRecordsAfterCompletion(),
                    DeleteBulkAction::make(),
                ]),
            ])
            ->emptyStateIcon(Heroicon::OutlinedPhoto)
            ->emptyStateHeading('No gallery images yet')
            ->emptyStateDescription('Add images and tag them with spaces and step options to build the mood boards.');
    }
}
