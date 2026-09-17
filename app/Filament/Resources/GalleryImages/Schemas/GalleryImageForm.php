<?php

namespace App\Filament\Resources\GalleryImages\Schemas;

use App\Enums\LivingEditStep;
use App\Enums\MoodBoardImageSlot;
use App\Filament\Forms\Components\MoodBoardSlotPicker;
use App\Filament\LivingEdit\Resources\LivingEditOptions\LivingEditOptionResource;
use App\Models\GalleryImage;
use App\Models\LivingEditOption;
use BackedEnum;
use Filament\Forms\Components\CheckboxList;
use Filament\Forms\Components\SpatieMediaLibraryFileUpload;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Group;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Schema;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\HtmlString;

class GalleryImageForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->columns(3)
            ->components([
                Group::make([
                    Section::make('Image')
                        ->description('Choose where the image sits on the mood board, then upload it.')
                        ->components([
                            MoodBoardSlotPicker::make('slot')
                                ->label('Position on the mood board')
                                ->required()
                                ->live(),
                            SpatieMediaLibraryFileUpload::make('image')
                                ->collection('image')
                                ->disk('public')
                                ->visibility('public')
                                ->required()
                                ->image()
                                ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp'])
                                ->maxSize(10240)
                                ->conversion('thumb')
                                ->imageEditor()
                                ->imageEditorAspectRatioOptions(fn (Get $get): array => static::selectedSlot($get)
                                    ? [static::selectedSlot($get)->aspectRatio(), null]
                                    : [])
                                ->helperText(fn (Get $get): string => static::uploadHelperText(static::selectedSlot($get))),
                            TextInput::make('alt_text')
                                ->label('Alt text')
                                ->maxLength(255)
                                ->helperText('A short description of the image for screen readers and search engines.'),
                        ]),

                    Section::make('Steps')
                        ->description('Pick at least one option in every step. The image is shown to visitors whose choices match.')
                        ->components([
                            Grid::make(['default' => 1, 'lg' => 2])
                                ->components(static::stepFields()),
                        ]),
                ])->columnSpan(['default' => 3, 'lg' => 2]),

                Group::make([
                    Section::make('Visibility')
                        ->components([
                            Toggle::make('is_active')
                                ->label('Active')
                                ->helperText('Inactive images are kept but never shown on the mood board.')
                                ->default(true),
                        ]),

                    Section::make('Spaces')
                        ->description('Spaces this image belongs to.')
                        ->components([
                            CheckboxList::make('spaces')
                                ->hiddenLabel()
                                ->relationship(
                                    titleAttribute: 'name',
                                    modifyQueryUsing: fn (Builder $query): Builder => $query->orderBy('sort_order'),
                                )
                                ->required()
                                ->validationMessages(['required' => 'Pick at least one space.'])
                                ->bulkToggleable(),
                        ]),
                ])->columnSpan(['default' => 3, 'lg' => 1]),
            ]);
    }

    /**
     * One checkbox list per step. They share the image's options relationship, so each one
     * loads and saves only the options of its own step.
     *
     * @return list<CheckboxList>
     */
    protected static function stepFields(): array
    {
        $optionsByStep = LivingEditOption::query()
            ->orderBy('sort_order')
            ->get()
            ->groupBy(fn (LivingEditOption $option): int => $option->step->value);

        return array_map(function (LivingEditStep $step) use ($optionsByStep): CheckboxList {
            /** @var Collection<int, LivingEditOption> $options */
            $options = $optionsByStep->get($step->value, new Collection);

            return CheckboxList::make("step_{$step->value}_options")
                ->label($step->getLabel())
                ->options($options->mapWithKeys(fn (LivingEditOption $option): array => [
                    $option->id => $option->is_active ? $option->name : "{$option->name} (inactive)",
                ])->all())
                ->required()
                ->validationMessages(['required' => "Pick at least one option for {$step->getLabel()}."])
                ->helperText($options->isEmpty() ? static::missingOptionsHelperText($step) : null)
                ->columns(2)
                ->bulkToggleable()
                ->searchable($options->count() > 8)
                ->afterStateHydrated(function (CheckboxList $component, ?GalleryImage $record) use ($step): void {
                    $component->state($record?->options
                        ->where('step', $step)
                        ->map(fn (LivingEditOption $option): string => (string) $option->id)
                        ->values()
                        ->all() ?? []);
                })
                ->dehydrated(false)
                ->saveRelationshipsUsing(fn (GalleryImage $record, array $state) => $record->syncStepOptions($step, $state));
        }, LivingEditStep::cases());
    }

    protected static function selectedSlot(Get $get): ?MoodBoardImageSlot
    {
        $slot = $get('slot');

        if ($slot instanceof MoodBoardImageSlot) {
            return $slot;
        }

        return MoodBoardImageSlot::tryFrom((int) ($slot instanceof BackedEnum ? $slot->value : $slot));
    }

    protected static function uploadHelperText(?MoodBoardImageSlot $slot): string
    {
        $formats = 'JPG, PNG or WebP up to 10 MB, converted to WebP automatically.';

        if (! $slot) {
            return $formats;
        }

        return "Best at {$slot->aspectRatio()}, the shape of the {$slot->getLabel()} position. Use the editor to crop. {$formats}";
    }

    protected static function missingOptionsHelperText(LivingEditStep $step): HtmlString
    {
        $url = e(LivingEditOptionResource::getUrl('create', configuration: $step->key()));

        return new HtmlString("No options yet. <a href=\"{$url}\" class=\"underline\">Add options to {$step->getLabel()}</a> first.");
    }
}
