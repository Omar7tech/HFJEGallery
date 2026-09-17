@php
    use App\Enums\MoodBoardImageSlot;
    use Filament\Support\Facades\FilamentAsset;

    $slot = $getSlot();
    $cellClass = fn (MoodBoardImageSlot $cell): string => 'mb-slot-mini__cell'.($cell === $slot ? ' mb-slot-mini__cell--active' : '');
@endphp

<div
    {{ $getExtraAttributeBag()->class(['mb-slot-mini-wrapper']) }}
    x-data
    x-load-css="[@js(FilamentAsset::getStyleHref('mood-board-slot-picker'))]"
>
    @if ($slot)
        <div class="mb-slot-mini" role="img" aria-label="{{ $slot->getLabel() }} position" title="{{ $slot->getLabel() }} · {{ $slot->aspectRatio() }}">
            <span class="{{ $cellClass(MoodBoardImageSlot::Large) }}"></span>
            <span class="mb-slot-mini__side">
                <span class="{{ $cellClass(MoodBoardImageSlot::TopRight) }}"></span>
                <span class="mb-slot-mini__swatches">
                    <span class="mb-slot-picker__swatch mb-slot-picker__swatch--dark"></span>
                    <span class="mb-slot-picker__swatch mb-slot-picker__swatch--light"></span>
                </span>
                <span class="mb-slot-mini__smalls">
                    <span class="{{ $cellClass(MoodBoardImageSlot::SmallLeft) }}"></span>
                    <span class="{{ $cellClass(MoodBoardImageSlot::SmallMiddle) }}"></span>
                    <span class="{{ $cellClass(MoodBoardImageSlot::SmallRight) }}"></span>
                </span>
            </span>
        </div>
        <span class="mb-slot-mini__label">{{ $slot->getLabel() }}</span>
    @endif
</div>
