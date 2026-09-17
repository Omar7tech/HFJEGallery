<?php

namespace App\Filament\Resources\StepThrees;

use App\Filament\Resources\StepThrees\Pages\CreateStepThree;
use App\Filament\Resources\StepThrees\Pages\EditStepThree;
use App\Filament\Resources\StepThrees\Pages\ListStepThrees;
use App\Filament\Resources\StepThrees\Pages\ViewStepThree;
use App\Filament\Resources\StepThrees\Schemas\StepThreeForm;
use App\Filament\Resources\StepThrees\Schemas\StepThreeInfolist;
use App\Filament\Resources\StepThrees\Tables\StepThreesTable;
use App\Models\StepThree;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use UnitEnum;

class StepThreeResource extends Resource
{
    protected static ?string $model = StepThree::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedCube;

    protected static string|UnitEnum|null $navigationGroup = 'Moodboard';

    protected static ?int $navigationSort = 4;

    protected static ?string $navigationLabel = 'Step 3';

    protected static ?string $modelLabel = 'step 3 option';

    protected static ?string $pluralModelLabel = 'step 3 options';

    protected static ?string $recordTitleAttribute = 'name';

    public static function form(Schema $schema): Schema
    {
        return StepThreeForm::configure($schema);
    }

    public static function infolist(Schema $schema): Schema
    {
        return StepThreeInfolist::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return StepThreesTable::configure($table);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListStepThrees::route('/'),
            'create' => CreateStepThree::route('/create'),
            'view' => ViewStepThree::route('/{record}'),
            'edit' => EditStepThree::route('/{record}/edit'),
        ];
    }
}
