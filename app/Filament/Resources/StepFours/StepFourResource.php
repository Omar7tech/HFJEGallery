<?php

namespace App\Filament\Resources\StepFours;

use App\Filament\Resources\StepFours\Pages\CreateStepFour;
use App\Filament\Resources\StepFours\Pages\EditStepFour;
use App\Filament\Resources\StepFours\Pages\ListStepFours;
use App\Filament\Resources\StepFours\Pages\ViewStepFour;
use App\Filament\Resources\StepFours\Schemas\StepFourForm;
use App\Filament\Resources\StepFours\Schemas\StepFourInfolist;
use App\Filament\Resources\StepFours\Tables\StepFoursTable;
use App\Models\StepFour;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use UnitEnum;

class StepFourResource extends Resource
{
    protected static ?string $model = StepFour::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedPaintBrush;

    protected static string|UnitEnum|null $navigationGroup = 'Moodboard';

    protected static ?int $navigationSort = 5;

    protected static ?string $navigationLabel = 'Step 4';

    protected static ?string $modelLabel = 'step 4 option';

    protected static ?string $pluralModelLabel = 'step 4 options';

    protected static ?string $recordTitleAttribute = 'name';

    public static function form(Schema $schema): Schema
    {
        return StepFourForm::configure($schema);
    }

    public static function infolist(Schema $schema): Schema
    {
        return StepFourInfolist::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return StepFoursTable::configure($table);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListStepFours::route('/'),
            'create' => CreateStepFour::route('/create'),
            'view' => ViewStepFour::route('/{record}'),
            'edit' => EditStepFour::route('/{record}/edit'),
        ];
    }
}
