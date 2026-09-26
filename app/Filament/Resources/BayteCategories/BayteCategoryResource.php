<?php

namespace App\Filament\Resources\BayteCategories;

use App\Filament\Resources\BayteCategories\Pages\CreateBayteCategory;
use App\Filament\Resources\BayteCategories\Pages\EditBayteCategory;
use App\Filament\Resources\BayteCategories\Pages\ListBayteCategories;
use App\Filament\Resources\BayteCategories\Schemas\BayteCategoryForm;
use App\Filament\Resources\BayteCategories\Tables\BayteCategoriesTable;
use App\Models\BayteCategory;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use UnitEnum;

class BayteCategoryResource extends Resource
{
    protected static ?string $model = BayteCategory::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    protected static string|UnitEnum|null $navigationGroup = 'BAYTE';

    protected static ?int $navigationSort = 1;

    protected static ?string $navigationLabel = 'Categories';

    protected static ?string $modelLabel = 'category';

    protected static ?string $pluralModelLabel = 'categories';

    protected static ?string $recordTitleAttribute = 'name';

    public static function form(Schema $schema): Schema
    {
        return BayteCategoryForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return BayteCategoriesTable::configure($table);
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
            'index' => ListBayteCategories::route('/'),
            'create' => CreateBayteCategory::route('/create'),
            'edit' => EditBayteCategory::route('/{record}/edit'),
        ];
    }
}
