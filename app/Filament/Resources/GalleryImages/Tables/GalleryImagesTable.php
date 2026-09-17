<?php

namespace App\Filament\Resources\GalleryImages\Tables;

use App\Enums\LivingEditStep;
use App\Models\GalleryImage;
use App\Models\LivingEditOption;
use Filament\Actions\BulkAction;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\SpatieMediaLibraryImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ToggleColumn;
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
            ->columns([
                SpatieMediaLibraryImageColumn::make('image')
                    ->collection('image')
                    ->conversion('thumb')
                    ->square()
                    ->imageSize(56)
                    ->extraImgAttributes(['loading' => 'lazy']),
                TextColumn::make('slot')
                    ->label('Position')
                    ->badge()
                    ->sortable(),
                TextColumn::make('spaces.name')
                    ->label('Spaces')
                    ->badge()
                    ->color('gray')
                    ->limitList(2)
                    ->expandableLimitedList(),
                ...array_map(
                    fn (LivingEditStep $step): TextColumn => TextColumn::make("step_{$step->value}")
                        ->label($step->getLabel())
                        ->state(fn (GalleryImage $record): array => $record->options
                            ->where('step', $step)
                            ->sortBy('sort_order')
                            ->map(fn (LivingEditOption $option): string => $option->name)
                            ->values()
                            ->all())
                        ->badge()
                        ->color('gray')
                        ->limitList(2)
                        ->expandableLimitedList()
                        ->toggleable(),
                    LivingEditStep::cases(),
                ),
                TextColumn::make('alt_text')
                    ->label('Alt text')
                    ->searchable()
                    ->limit(40)
                    ->toggleable(isToggledHiddenByDefault: true),
                ToggleColumn::make('is_active')
                    ->label('Active')
                    ->sortable(),
                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('updated_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
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
            ], layout: FiltersLayout::AboveContent)
            ->filtersFormColumns(['md' => 3, 'xl' => 6])
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
