<?php

namespace App\Filament\Resources\WorkCategories;

use App\Filament\Resources\WorkCategories\Pages\CreateWorkCategory;
use App\Filament\Resources\WorkCategories\Pages\EditWorkCategory;
use App\Filament\Resources\WorkCategories\Pages\ListWorkCategories;
use App\Filament\Resources\WorkCategories\Schemas\WorkCategoryForm;
use App\Filament\Resources\WorkCategories\Tables\WorkCategoriesTable;
use App\Models\WorkCategory;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use UnitEnum;

class WorkCategoryResource extends Resource
{
    protected static ?string $model = WorkCategory::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    protected static string|UnitEnum|null $navigationGroup = 'Work';

    protected static ?int $navigationSort = 1;

    protected static ?string $navigationLabel = 'Categories';

    protected static ?string $modelLabel = 'work category';

    protected static ?string $pluralModelLabel = 'work categories';

    protected static ?string $recordTitleAttribute = 'name';

    public static function form(Schema $schema): Schema
    {
        return WorkCategoryForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return WorkCategoriesTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListWorkCategories::route('/'),
            'create' => CreateWorkCategory::route('/create'),
            'edit' => EditWorkCategory::route('/{record}/edit'),
        ];
    }
}
