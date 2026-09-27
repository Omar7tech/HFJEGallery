<?php

namespace App\Filament\Resources\Projects\Schemas;

use App\Filament\Resources\WorkTags\WorkTagResource;
use App\Models\WorkTag;
use Filament\Actions\Action;
use Filament\Forms\Components\CheckboxList;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\SpatieMediaLibraryFileUpload;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;
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
            ->components([
                Section::make('Details')
                    ->description('Everything shown on the project card and page.')
                    ->columnSpanFull()
                    ->columns(2)
                    ->components([
                        TextInput::make('name')
                            ->required()
                            ->maxLength(255)
                            ->unique(ignoreRecord: true),
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
                        TextInput::make('location')
                            ->maxLength(255),
                        TextInput::make('year')
                            ->numeric()
                            ->minValue(1950)
                            ->maxValue(2100),
                        Textarea::make('summary')
                            ->maxLength(255)
                            ->rows(2)
                            ->helperText('One short line, shown under the project name.')
                            ->columnSpanFull(),
                        RichEditor::make('description')
                            ->toolbarButtons([
                                ['bold', 'italic', 'underline', 'link'],
                                ['h2', 'h3'],
                                ['bulletList', 'orderedList', 'blockquote'],
                                ['undo', 'redo'],
                            ])
                            ->helperText('The story of the project, shown under the summary.')
                            ->columnSpanFull(),
                    ]),

                Section::make('Cover')
                    ->description('The main photo, used on the card and at the top of the project page.')
                    ->columnSpanFull()
                    ->components([
                        SpatieMediaLibraryFileUpload::make('cover')
                            ->hiddenLabel()
                            ->collection('cover')
                            ->disk('public')
                            ->visibility('public')
                            ->image()
                            ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp'])
                            ->maxSize(10240)
                            ->conversion('thumb')
                            ->imageEditor()
                            ->helperText('JPG, PNG or WebP up to 10 MB, converted to WebP automatically.'),
                    ]),

                Section::make('Gallery')
                    ->description('Drag to reorder. The gallery follows this order on the site.')
                    ->columnSpanFull()
                    ->components([
                        SpatieMediaLibraryFileUpload::make('gallery')
                            ->hiddenLabel()
                            ->collection('gallery')
                            ->disk('public')
                            ->visibility('public')
                            ->multiple()
                            ->reorderable()
                            ->panelLayout('grid')
                            ->image()
                            ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp'])
                            ->maxSize(10240)
                            ->maxFiles(40)
                            ->conversion('thumb')
                            ->helperText('Up to 40 photos, converted to WebP automatically.'),
                    ]),
            ]);
    }
}
