<?php

namespace App\Filament\Resources\WorkTags\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Grouping\Group;
use Filament\Tables\Table;

class WorkTagsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->reorderable('sort_order')
            ->defaultSort('sort_order')
            ->groups([
                Group::make('category.name')
                    ->label('Category')
                    ->collapsible(),
            ])
            ->defaultGroup('category.name')
            ->columns([
                TextColumn::make('name')
                    ->searchable()
                    ->sortable()
                    ->weight('medium'),
                TextColumn::make('category.name')
                    ->label('Category')
                    ->sortable()
                    ->badge(),
                TextColumn::make('projects_count')
                    ->label('Projects')
                    ->counts('projects')
                    ->sortable(),
            ])
            ->filters([
                SelectFilter::make('work_category_id')
                    ->label('Category')
                    ->relationship('category', 'name')
                    ->preload(),
            ])
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
