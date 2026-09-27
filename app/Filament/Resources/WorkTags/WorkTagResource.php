<?php

namespace App\Filament\Resources\WorkTags;

use App\Filament\Resources\WorkTags\Pages\CreateWorkTag;
use App\Filament\Resources\WorkTags\Pages\EditWorkTag;
use App\Filament\Resources\WorkTags\Pages\ListWorkTags;
use App\Filament\Resources\WorkTags\Schemas\WorkTagForm;
use App\Filament\Resources\WorkTags\Tables\WorkTagsTable;
use App\Models\WorkTag;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use UnitEnum;

class WorkTagResource extends Resource
{
    protected static ?string $model = WorkTag::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedTag;

    protected static string|UnitEnum|null $navigationGroup = 'Work';

    protected static ?int $navigationSort = 2;

    protected static ?string $navigationLabel = 'Tags';

    protected static ?string $modelLabel = 'tag';

    protected static ?string $recordTitleAttribute = 'name';

    public static function form(Schema $schema): Schema
    {
        return WorkTagForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return WorkTagsTable::configure($table);
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
            'index' => ListWorkTags::route('/'),
            'create' => CreateWorkTag::route('/create'),
            'edit' => EditWorkTag::route('/{record}/edit'),
        ];
    }
}
