<?php

namespace App\Filament\Pages;

use App\Settings\GeneralSettings;
use BackedEnum;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Pages\SettingsPage;
use Filament\Schemas\Components\Tabs;
use Filament\Schemas\Components\Tabs\Tab;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use UnitEnum;

class ManageGeneral extends SettingsPage
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedCog6Tooth;

    protected static ?string $navigationLabel = 'General';

    protected static string|UnitEnum|null $navigationGroup = 'Settings';

    protected static string $settings = GeneralSettings::class;

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Tabs::make()
                    ->columnSpanFull()
                    ->tabs([
                        Tab::make('Contact')
                            ->icon(Heroicon::OutlinedPhone)
                            ->schema([
                                Toggle::make('phone_number_enabled')
                                    ->label('Show the phone number')
                                    ->helperText('Shows the number in the site footer so visitors can call the studio.')
                                    ->default(false)
                                    ->columnSpanFull(),

                                TextInput::make('phone_number')
                                    ->label('Phone number')
                                    ->helperText('Include the country code, e.g. +961 3 145 782.')
                                    ->tel()
                                    ->maxLength(255)
                                    ->requiredIf('phone_number_enabled', true)
                                    ->columnSpanFull()
                                    ->visibleJs(<<<'JS'
                                        $get('phone_number_enabled')
                                        JS),

                                TextInput::make('email')
                                    ->label('Email')
                                    ->helperText('Shown in the site footer. Leave empty to hide it.')
                                    ->email()
                                    ->maxLength(255)
                                    ->columnSpanFull(),
                            ]),

                        Tab::make('Social')
                            ->icon(Heroicon::OutlinedShare)
                            ->schema([
                                Repeater::make('social_links')
                                    ->label('Social links')
                                    ->helperText('These appear in the site footer, in this order.')
                                    ->addActionLabel('Add link')
                                    ->defaultItems(0)
                                    ->reorderable()
                                    ->collapsible()
                                    ->columnSpanFull()
                                    ->itemLabel(fn (array $state): ?string => filled($state['label'] ?? null) ? (string) $state['label'] : null)
                                    ->columns(2)
                                    ->schema([
                                        TextInput::make('label')
                                            ->label('Name')
                                            ->placeholder('Instagram')
                                            ->required()
                                            ->maxLength(50),

                                        TextInput::make('url')
                                            ->label('Link')
                                            ->placeholder('https://instagram.com/hfje')
                                            ->url()
                                            ->required()
                                            ->maxLength(255),
                                    ]),
                            ]),
                    ]),
            ]);
    }
}
