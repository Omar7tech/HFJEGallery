<?php

namespace App\Filament\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\Column;
use Filament\Tables\Columns\SpatieMediaLibraryImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\BaseFilter;
use Filament\Tables\Table;

/**
 * The list every portfolio piece shares (work projects, curtain works): drag to
 * reorder, cover, name, location and year. A resource adds its own columns,
 * such as a category, after the name, and its own filters.
 */
class PortfolioTable
{
    /**
     * @param  list<Column>  $columns  Extra columns placed after the name.
     * @param  list<BaseFilter>  $filters
     */
    public static function configure(Table $table, array $columns = [], array $filters = []): Table
    {
        return $table
            ->reorderable('sort_order')
            ->defaultSort('sort_order')
            ->columns([
                SpatieMediaLibraryImageColumn::make('cover')
                    ->label('Cover')
                    ->collection('cover')
                    ->conversion('thumb')
                    ->imageSize(44),
                TextColumn::make('name')
                    ->searchable()
                    ->sortable()
                    ->weight('medium'),
                ...$columns,
                TextColumn::make('location')
                    ->searchable()
                    ->toggleable(),
                TextColumn::make('year')
                    ->sortable()
                    ->toggleable(),
            ])
            ->filters($filters)
            ->recordActions([
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
