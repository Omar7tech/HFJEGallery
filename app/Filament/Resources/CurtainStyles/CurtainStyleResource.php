<?php

namespace App\Filament\Resources\CurtainStyles;

use App\Filament\Resources\CurtainStyles\Pages\CreateCurtainStyle;
use App\Filament\Resources\CurtainStyles\Pages\EditCurtainStyle;
use App\Filament\Resources\CurtainStyles\Pages\ListCurtainStyles;
use App\Filament\Resources\CurtainStyles\Schemas\CurtainStyleForm;
use App\Filament\Resources\CurtainStyles\Tables\CurtainStylesTable;
use App\Models\CurtainStyle;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use UnitEnum;

class CurtainStyleResource extends Resource
{
    protected static ?string $model = CurtainStyle::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedSwatch;

    protected static string|UnitEnum|null $navigationGroup = 'Curtains';

    protected static ?int $navigationSort = 1;

    protected static ?string $navigationLabel = 'Styles';

    protected static ?string $modelLabel = 'curtain style';

    protected static ?string $recordTitleAttribute = 'name';

    public static function form(Schema $schema): Schema
    {
        return CurtainStyleForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return CurtainStylesTable::configure($table);
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
            'index' => ListCurtainStyles::route('/'),
            'create' => CreateCurtainStyle::route('/create'),
            'edit' => EditCurtainStyle::route('/{record}/edit'),
        ];
    }
}
