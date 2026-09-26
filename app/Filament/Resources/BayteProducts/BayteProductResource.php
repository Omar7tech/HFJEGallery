<?php

namespace App\Filament\Resources\BayteProducts;

use App\Filament\Resources\BayteProducts\Pages\CreateBayteProduct;
use App\Filament\Resources\BayteProducts\Pages\EditBayteProduct;
use App\Filament\Resources\BayteProducts\Pages\ListBayteProducts;
use App\Filament\Resources\BayteProducts\Schemas\BayteProductForm;
use App\Filament\Resources\BayteProducts\Tables\BayteProductsTable;
use App\Models\BayteProduct;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use UnitEnum;

class BayteProductResource extends Resource
{
    protected static ?string $model = BayteProduct::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedSquares2x2;

    protected static string|UnitEnum|null $navigationGroup = 'BAYTE';

    protected static ?int $navigationSort = 2;

    protected static ?string $navigationLabel = 'Products';

    protected static ?string $modelLabel = 'product';

    protected static ?string $recordTitleAttribute = 'name';

    public static function form(Schema $schema): Schema
    {
        return BayteProductForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return BayteProductsTable::configure($table);
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
            'index' => ListBayteProducts::route('/'),
            'create' => CreateBayteProduct::route('/create'),
            'edit' => EditBayteProduct::route('/{record}/edit'),
        ];
    }
}
