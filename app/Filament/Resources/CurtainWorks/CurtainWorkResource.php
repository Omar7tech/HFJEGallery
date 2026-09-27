<?php

namespace App\Filament\Resources\CurtainWorks;

use App\Filament\Resources\CurtainWorks\Pages\CreateCurtainWork;
use App\Filament\Resources\CurtainWorks\Pages\EditCurtainWork;
use App\Filament\Resources\CurtainWorks\Pages\ListCurtainWorks;
use App\Filament\Resources\CurtainWorks\Schemas\CurtainWorkForm;
use App\Filament\Resources\CurtainWorks\Tables\CurtainWorksTable;
use App\Models\CurtainWork;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use UnitEnum;

class CurtainWorkResource extends Resource
{
    protected static ?string $model = CurtainWork::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedPhoto;

    protected static string|UnitEnum|null $navigationGroup = 'Curtains';

    protected static ?int $navigationSort = 2;

    protected static ?string $navigationLabel = 'Projects';

    protected static ?string $modelLabel = 'curtain project';

    protected static ?string $recordTitleAttribute = 'name';

    public static function form(Schema $schema): Schema
    {
        return CurtainWorkForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return CurtainWorksTable::configure($table);
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
            'index' => ListCurtainWorks::route('/'),
            'create' => CreateCurtainWork::route('/create'),
            'edit' => EditCurtainWork::route('/{record}/edit'),
        ];
    }
}
