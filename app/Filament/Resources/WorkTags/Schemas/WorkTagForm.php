<?php

namespace App\Filament\Resources\WorkTags\Schemas;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Components\Utilities\Set;
use Filament\Schemas\Schema;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Validation\Rules\Unique;

class WorkTagForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Details')
                    ->description('A sub-category shown as a filter on its category page. Tags without projects stay hidden on the site.')
                    ->columnSpanFull()
                    ->columns(2)
                    ->components([
                        Select::make('work_category_id')
                            ->label('Category')
                            ->relationship(
                                name: 'category',
                                titleAttribute: 'name',
                                modifyQueryUsing: fn (Builder $query): Builder => $query->orderBy('sort_order'),
                            )
                            ->required()
                            ->preload()
                            ->searchable()
                            ->live()
                            // Projects belong to one category: switching category drops them.
                            ->afterStateUpdated(fn (Set $set) => $set('projects', [])),
                        TextInput::make('name')
                            ->required()
                            ->maxLength(255)
                            // Two categories may share a name; one category may not repeat it.
                            ->unique(
                                ignoreRecord: true,
                                modifyRuleUsing: fn (Unique $rule, Get $get): Unique => $rule
                                    ->where('work_category_id', $get('work_category_id')),
                            ),
                        Select::make('projects')
                            ->relationship(
                                name: 'projects',
                                titleAttribute: 'name',
                                modifyQueryUsing: fn (Builder $query, Get $get): Builder => $query
                                    ->where('work_category_id', $get('work_category_id'))
                                    ->orderBy('sort_order'),
                            )
                            ->multiple()
                            ->preload()
                            ->disabled(fn (Get $get): bool => blank($get('work_category_id')))
                            ->helperText('The projects of this category that carry the tag. Tags can also be picked on each project.')
                            ->columnSpanFull(),
                    ]),
            ]);
    }
}
