<?php

namespace App\Filament\LivingEdit\Resources\LivingEditOptions\Schemas;

use App\Filament\LivingEdit\Resources\LivingEditOptions\LivingEditOptionResource;
use Filament\Forms\Components\SpatieMediaLibraryFileUpload;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Illuminate\Validation\Rules\Unique;

class LivingEditOptionForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Details')
                    ->description('Basic information about the option.')
                    ->columnSpanFull()
                    ->columns(2)
                    ->components([
                        TextInput::make('name')
                            ->required()
                            ->maxLength(255)
                            ->unique(modifyRuleUsing: fn (Unique $rule): Unique => $rule->where('step', LivingEditOptionResource::getStep())),
                        Toggle::make('is_active')
                            ->label('Active')
                            ->default(true)
                            ->inline(false),
                    ]),

                Section::make('Icon')
                    ->description('Icon shown on the moodboard.')
                    ->columnSpanFull()
                    ->components([
                        SpatieMediaLibraryFileUpload::make('icon')
                            ->hiddenLabel()
                            ->collection('icon')
                            ->disk('public')
                            ->visibility('public')
                            ->image()
                            ->acceptedFileTypes(['image/png', 'image/webp'])
                            ->maxSize(1024)
                            ->conversion('webp')
                            ->imageEditor()
                            ->imageEditorAspectRatioOptions(['1:1'])
                            ->helperText('Square PNG or WebP with a transparent background.'),
                    ]),
            ]);
    }
}
