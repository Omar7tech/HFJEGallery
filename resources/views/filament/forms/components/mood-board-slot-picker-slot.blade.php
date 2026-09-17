@php
    $details = $slots[$slot->value];
@endphp

<label
    @class(['mb-slot-picker__slot', 'mb-slot-picker__slot--small' => $isSmall])
    title="{{ $details['description'] }}"
>
    <input
        type="radio"
        name="{{ $inputName }}"
        value="{{ $slot->value }}"
        x-model.number="state"
        class="mb-slot-picker__input"
        @disabled($isDisabled)
    />
    <span class="mb-slot-picker__label">{{ $details['label'] }}</span>
    <span class="mb-slot-picker__ratio">{{ $details['aspectRatio'] }}</span>
</label>
