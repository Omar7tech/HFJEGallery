<?php

namespace App\Filament\Resources\Projects\Tables;

use App\Filament\Tables\PortfolioTable;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class ProjectsTable
{
    public static function configure(Table $table): Table
    {
        return PortfolioTable::configure(
            $table,
            columns: [
                TextColumn::make('category.name')
                    ->label('Category')
                    ->sortable()
                    ->badge(),
                TextColumn::make('tags.name')
                    ->label('Tags')
                    ->badge()
                    ->color('gray')
                    ->toggleable(),
            ],
            filters: [
                SelectFilter::make('work_category_id')
                    ->label('Category')
                    ->relationship('category', 'name')
                    ->preload(),
            ],
        );
    }
}
