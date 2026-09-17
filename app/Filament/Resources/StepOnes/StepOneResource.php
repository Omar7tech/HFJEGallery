<?php

namespace App\Filament\Resources\StepOnes;

use App\Filament\Resources\StepOnes\Pages\CreateStepOne;
use App\Filament\Resources\StepOnes\Pages\EditStepOne;
use App\Filament\Resources\StepOnes\Pages\ListStepOnes;
use App\Filament\Resources\StepOnes\Pages\ViewStepOne;
use App\Filament\Resources\StepOnes\Schemas\StepOneForm;
use App\Filament\Resources\StepOnes\Schemas\StepOneInfolist;
use App\Filament\Resources\StepOnes\Tables\StepOnesTable;
use App\Models\StepOne;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use UnitEnum;

class StepOneResource extends Resource
{
    protected static ?string $model = StepOne::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedSwatch;

    protected static string|UnitEnum|null $navigationGroup = 'Moodboard';

    protected static ?int $navigationSort = 2;

    protected static ?string $navigationLabel = 'Step 1';

    protected static ?string $modelLabel = 'step 1 option';

    protected static ?string $pluralModelLabel = 'step 1 options';

    protected static ?string $recordTitleAttribute = 'name';

    public static function form(Schema $schema): Schema
    {
        return StepOneForm::configure($schema);
    }

    public static function infolist(Schema $schema): Schema
    {
        return StepOneInfolist::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return StepOnesTable::configure($table);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListStepOnes::route('/'),
            'create' => CreateStepOne::route('/create'),
            'view' => ViewStepOne::route('/{record}'),
            'edit' => EditStepOne::route('/{record}/edit'),
        ];
    }
}
