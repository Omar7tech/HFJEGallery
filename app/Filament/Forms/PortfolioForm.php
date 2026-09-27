<?php

namespace App\Filament\Forms;

use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\SpatieMediaLibraryFileUpload;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Component;
use Filament\Schemas\Components\Section;

/**
 * The form sections every portfolio piece shares (work projects, curtain
 * works): details, cover and gallery. A resource adds its own fields, such as
 * a category, into the details beside the name.
 */
class PortfolioForm
{
    /**
     * @param  list<Component>  $fields  Extra fields placed after the name.
     * @return list<Section>
     */
    public static function sections(array $fields = []): array
    {
        return [
            static::details($fields),
            static::cover(),
            static::gallery(),
        ];
    }

    /**
     * @param  list<Component>  $fields
     */
    public static function details(array $fields = []): Section
    {
        return Section::make('Details')
            ->description('Everything shown on the project card and page.')
            ->columnSpanFull()
            ->columns(2)
            ->components([
                TextInput::make('name')
                    ->required()
                    ->maxLength(255)
                    ->unique(ignoreRecord: true),
                ...$fields,
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
            ]);
    }

    public static function cover(): Section
    {
        return Section::make('Cover')
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
            ]);
    }

    public static function gallery(): Section
    {
        return Section::make('Gallery')
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
            ]);
    }
}
