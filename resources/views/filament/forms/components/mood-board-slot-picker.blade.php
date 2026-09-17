@php
    use App\Enums\MoodBoardImageSlot;
    use Filament\Support\Facades\FilamentAsset;

    $slots = $getSlots();
    $statePath = $getStatePath();
    $isDisabled = $isDisabled();
    $inputName = str_replace('.', '-', $statePath);
@endphp

<x-dynamic-component :component="$getFieldWrapperView()" :field="$field">
    <div
        x-data="{
            state: $wire.{{ $applyStateBindingModifiers("\$entangle('{$statePath}')") }},
            slots: @js($slots),
        }"
        x-load-css="[@js(FilamentAsset::getStyleHref('mood-board-slot-picker'))]"
    >
        <div
            role="radiogroup"
            aria-label="{{ $getLabel() }}"
            @class(['mb-slot-picker', 'mb-slot-picker--disabled' => $isDisabled])
        >
            @include('filament.forms.components.mood-board-slot-picker-slot', ['slot' => MoodBoardImageSlot::Large, 'isSmall' => false])

            <div class="mb-slot-picker__side">
                @include('filament.forms.components.mood-board-slot-picker-slot', ['slot' => MoodBoardImageSlot::TopRight, 'isSmall' => false])

                <div class="mb-slot-picker__swatches" aria-hidden="true">
                    <span class="mb-slot-picker__swatch mb-slot-picker__swatch--dark"></span>
                    <span class="mb-slot-picker__swatch mb-slot-picker__swatch--light"></span>
                </div>

                <div class="mb-slot-picker__smalls">
                    @foreach ([MoodBoardImageSlot::SmallLeft, MoodBoardImageSlot::SmallMiddle, MoodBoardImageSlot::SmallRight] as $smallSlot)
                        @include('filament.forms.components.mood-board-slot-picker-slot', ['slot' => $smallSlot, 'isSmall' => true])
                    @endforeach
                </div>
            </div>
        </div>

        <p class="mb-slot-picker__summary" aria-live="polite">
            <template x-if="slots[state]">
                <span>
                    <strong x-text="slots[state].label"></strong>
                    <span x-text="'· ' + slots[state].aspectRatio + ' · ' + slots[state].description"></span>
                </span>
            </template>
            <template x-if="! slots[state]">
                <span>Click a position on the board to upload its image.</span>
            </template>
        </p>
    </div>
</x-dynamic-component>
