<?php

namespace App\Filament\Resources\LivingSpaces;

use App\Filament\Resources\LivingSpaces\Pages\CreateLivingSpace;
use App\Filament\Resources\LivingSpaces\Pages\EditLivingSpace;
use App\Filament\Resources\LivingSpaces\Pages\ListLivingSpaces;
use App\Filament\Resources\LivingSpaces\Pages\ViewLivingSpace;
use App\Filament\Resources\LivingSpaces\Schemas\LivingSpaceForm;
use App\Filament\Resources\LivingSpaces\Schemas\LivingSpaceInfolist;
use App\Filament\Resources\LivingSpaces\Tables\LivingSpacesTable;
use App\Models\LivingSpace;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use UnitEnum;

class LivingSpaceResource extends Resource
{
    protected static ?string $model = LivingSpace::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedHome;

    protected static string|UnitEnum|null $navigationGroup = 'Moodboard';

    protected static ?int $navigationSort = 1;

    protected static ?string $navigationLabel = 'Spaces';

    protected static ?string $modelLabel = 'space';

    protected static ?string $recordTitleAttribute = 'name';

    public static function form(Schema $schema): Schema
    {
        return LivingSpaceForm::configure($schema);
    }

    public static function infolist(Schema $schema): Schema
    {
        return LivingSpaceInfolist::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return LivingSpacesTable::configure($table);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListLivingSpaces::route('/'),
            'create' => CreateLivingSpace::route('/create'),
            'view' => ViewLivingSpace::route('/{record}'),
            'edit' => EditLivingSpace::route('/{record}/edit'),
        ];
    }
}
