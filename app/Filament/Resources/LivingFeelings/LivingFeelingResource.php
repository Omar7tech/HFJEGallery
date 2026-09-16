<?php

namespace App\Filament\Resources\LivingFeelings;

use App\Filament\Resources\LivingFeelings\Pages\CreateLivingFeeling;
use App\Filament\Resources\LivingFeelings\Pages\EditLivingFeeling;
use App\Filament\Resources\LivingFeelings\Pages\ListLivingFeelings;
use App\Filament\Resources\LivingFeelings\Pages\ViewLivingFeeling;
use App\Filament\Resources\LivingFeelings\Schemas\LivingFeelingForm;
use App\Filament\Resources\LivingFeelings\Schemas\LivingFeelingInfolist;
use App\Filament\Resources\LivingFeelings\Tables\LivingFeelingsTable;
use App\Models\LivingFeeling;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use UnitEnum;

class LivingFeelingResource extends Resource
{
    protected static ?string $model = LivingFeeling::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedSwatch;

    protected static string|UnitEnum|null $navigationGroup = 'Moodboard';

    protected static ?int $navigationSort = 2;

    protected static ?string $navigationLabel = 'Feelings';

    protected static ?string $modelLabel = 'feeling';

    protected static ?string $recordTitleAttribute = 'name';

    public static function form(Schema $schema): Schema
    {
        return LivingFeelingForm::configure($schema);
    }

    public static function infolist(Schema $schema): Schema
    {
        return LivingFeelingInfolist::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return LivingFeelingsTable::configure($table);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListLivingFeelings::route('/'),
            'create' => CreateLivingFeeling::route('/create'),
            'view' => ViewLivingFeeling::route('/{record}'),
            'edit' => EditLivingFeeling::route('/{record}/edit'),
        ];
    }
}
