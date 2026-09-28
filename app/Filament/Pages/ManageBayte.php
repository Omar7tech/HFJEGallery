<?php

namespace App\Filament\Pages;

use App\Settings\BayteSettings;
use BackedEnum;
use Filament\Forms\Components\TextInput;
use Filament\Pages\SettingsPage;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use UnitEnum;

class ManageBayte extends SettingsPage
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedCog6Tooth;

    protected static ?string $navigationLabel = 'Settings';

    protected static string|UnitEnum|null $navigationGroup = 'BAYTE';

    protected static ?int $navigationSort = 3;

    protected static ?string $title = 'BAYTE settings';

    protected static ?string $slug = 'bayte-settings';

    protected static string $settings = BayteSettings::class;

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('whatsapp_number')
                    ->label('WhatsApp number')
                    ->helperText('Visitors send the pieces they want to know more about to this number. Include the country code, e.g. +961 3 145 782. Leave empty and visitors can still build a selection, but the send button stays disabled.')
                    ->tel()
                    ->regex('/^\+?[\d\s\-().]{6,}$/')
                    ->maxLength(30)
                    ->columnSpanFull(),
            ]);
    }
}
