<?php

namespace App\Filament\LivingEdit\Resources\LivingEditOptions;

use App\Enums\LivingEditStep;
use App\Filament\LivingEdit\Resources\LivingEditOptions\Pages\CreateLivingEditOption;
use App\Filament\LivingEdit\Resources\LivingEditOptions\Pages\EditLivingEditOption;
use App\Filament\LivingEdit\Resources\LivingEditOptions\Pages\ListLivingEditOptions;
use App\Filament\LivingEdit\Resources\LivingEditOptions\Pages\ViewLivingEditOption;
use App\Filament\LivingEdit\Resources\LivingEditOptions\Schemas\LivingEditOptionForm;
use App\Filament\LivingEdit\Resources\LivingEditOptions\Schemas\LivingEditOptionInfolist;
use App\Filament\LivingEdit\Resources\LivingEditOptions\Tables\LivingEditOptionsTable;
use App\Models\LivingEditOption;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables\Table;
use Illuminate\Contracts\Support\Htmlable;
use Illuminate\Database\Eloquent\Builder;
use UnitEnum;

/**
 * Registered once per step in the panel provider, so every step keeps its own sidebar item and URL.
 *
 * @extends resource<LivingEditOption, LivingEditOptionResourceConfiguration>
 */
class LivingEditOptionResource extends Resource
{
    protected static ?string $model = LivingEditOption::class;

    protected static ?string $configurationClass = LivingEditOptionResourceConfiguration::class;

    protected static string|UnitEnum|null $navigationGroup = 'Moodboard';

    protected static ?string $recordTitleAttribute = 'name';

    /**
     * The step of the current registration, or null outside of one.
     */
    public static function getStep(): ?LivingEditStep
    {
        return static::getConfiguration()?->getStep();
    }

    /**
     * @return Builder<LivingEditOption>
     */
    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()
            ->when(static::getStep(), fn (Builder $query, LivingEditStep $step): Builder => $query->where('step', $step));
    }

    public static function getNavigationLabel(): string
    {
        return static::getStep()?->getLabel() ?? parent::getNavigationLabel();
    }

    public static function getNavigationIcon(): string|BackedEnum|Htmlable|null
    {
        return static::getStep()?->getIcon();
    }

    public static function getNavigationSort(): ?int
    {
        $step = static::getStep();

        return $step ? $step->value + 1 : parent::getNavigationSort();
    }

    public static function getModelLabel(): string
    {
        $step = static::getStep();

        return $step ? "{$step->getLabel()} Option" : parent::getModelLabel();
    }

    public static function getPluralModelLabel(): string
    {
        $step = static::getStep();

        return $step ? "{$step->getLabel()} Options" : parent::getPluralModelLabel();
    }

    public static function form(Schema $schema): Schema
    {
        return LivingEditOptionForm::configure($schema);
    }

    public static function infolist(Schema $schema): Schema
    {
        return LivingEditOptionInfolist::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return LivingEditOptionsTable::configure($table);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListLivingEditOptions::route('/'),
            'create' => CreateLivingEditOption::route('/create'),
            'view' => ViewLivingEditOption::route('/{record}'),
            'edit' => EditLivingEditOption::route('/{record}/edit'),
        ];
    }
}
