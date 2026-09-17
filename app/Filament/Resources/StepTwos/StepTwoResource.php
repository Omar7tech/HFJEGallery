<?php

namespace App\Filament\Resources\StepTwos;

use App\Filament\Resources\StepTwos\Pages\CreateStepTwo;
use App\Filament\Resources\StepTwos\Pages\EditStepTwo;
use App\Filament\Resources\StepTwos\Pages\ListStepTwos;
use App\Filament\Resources\StepTwos\Pages\ViewStepTwo;
use App\Filament\Resources\StepTwos\Schemas\StepTwoForm;
use App\Filament\Resources\StepTwos\Schemas\StepTwoInfolist;
use App\Filament\Resources\StepTwos\Tables\StepTwosTable;
use App\Models\StepTwo;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use UnitEnum;

class StepTwoResource extends Resource
{
    protected static ?string $model = StepTwo::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedSparkles;

    protected static string|UnitEnum|null $navigationGroup = 'Moodboard';

    protected static ?int $navigationSort = 3;

    protected static ?string $navigationLabel = 'Step 2';

    protected static ?string $modelLabel = 'step 2 option';

    protected static ?string $pluralModelLabel = 'step 2 options';

    protected static ?string $recordTitleAttribute = 'name';

    public static function form(Schema $schema): Schema
    {
        return StepTwoForm::configure($schema);
    }

    public static function infolist(Schema $schema): Schema
    {
        return StepTwoInfolist::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return StepTwosTable::configure($table);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListStepTwos::route('/'),
            'create' => CreateStepTwo::route('/create'),
            'view' => ViewStepTwo::route('/{record}'),
            'edit' => EditStepTwo::route('/{record}/edit'),
        ];
    }
}
