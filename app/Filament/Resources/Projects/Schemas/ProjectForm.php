<?php

namespace App\Filament\Resources\Projects\Schemas;

use App\Filament\Forms\PortfolioForm;
use App\Filament\Resources\WorkTags\WorkTagResource;
use App\Models\WorkTag;
use Filament\Actions\Action;
use Filament\Forms\Components\CheckboxList;
use Filament\Forms\Components\Select;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Components\Utilities\Set;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Illuminate\Database\Eloquent\Builder;

class ProjectForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components(PortfolioForm::sections([
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
                    // Tags belong to one category: switching category drops them.
                    ->afterStateUpdated(fn (Set $set) => $set('tags', [])),
                // Every tag of the chosen category laid out as a checkbox,
                // so they are all in sight without opening a dropdown.
                CheckboxList::make('tags')
                    ->relationship(
                        name: 'tags',
                        titleAttribute: 'name',
                        modifyQueryUsing: fn (Builder $query, Get $get): Builder => $query
                            ->where('work_category_id', $get('work_category_id'))
                            ->orderBy('sort_order')
                            ->orderBy('id'),
                    )
                    ->columns(4)
                    ->gridDirection('row')
                    ->hintAction(
                        Action::make('manageTags')
                            ->label('Manage tags')
                            ->icon(Heroicon::OutlinedTag)
                            ->url(fn (): string => WorkTagResource::getUrl('index'), shouldOpenInNewTab: true),
                    )
                    ->helperText(fn (Get $get): string => match (true) {
                        blank($get('work_category_id')) => 'Pick a category to see its tags.',
                        ! WorkTag::query()->where('work_category_id', $get('work_category_id'))->exists() => 'This category has no tags yet. Add them from “Manage tags”.',
                        default => 'Filters on the category page. A project can have several.',
                    })
                    ->columnSpanFull(),
            ]));
    }
}
