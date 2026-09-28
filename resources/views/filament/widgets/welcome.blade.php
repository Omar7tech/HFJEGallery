@php
    use Filament\Support\Icons\Heroicon;
@endphp

<x-filament-widgets::widget class="hf-welcome">
    <div
        class="relative grid overflow-hidden rounded-[14px] bg-(--hf-card) ring-1 ring-(--hf-line) md:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]"
    >
        <div class="relative z-10 flex flex-col justify-center gap-2 px-5 py-5 md:px-7 md:py-6">
            <p class="text-xs text-(--hf-text-faint)">{{ $date }}</p>

            <h2 class="font-[Michroma] text-lg leading-snug tracking-tight text-(--hf-text) md:text-xl">
                {{ $greeting }}{{ $firstName ? ', '.$firstName : '' }}.
            </h2>

            <p class="max-w-lg text-sm leading-relaxed text-(--hf-text-soft)">
                {{ $status }}
            </p>

            <div class="mt-2 flex flex-wrap items-center gap-2">
                <x-filament::button
                    tag="a"
                    :href="$links['project']"
                    size="sm"
                    :icon="Heroicon::Plus"
                >
                    New project
                </x-filament::button>

                <x-filament::button
                    tag="a"
                    :href="$links['piece']"
                    size="sm"
                    color="gray"
                    :icon="Heroicon::Plus"
                >
                    New BAYTÉ piece
                </x-filament::button>

                <x-filament::button
                    tag="a"
                    :href="$links['inbox']"
                    size="sm"
                    color="gray"
                    :icon="Heroicon::OutlinedInbox"
                    :badge="$unread > 0 ? $unread : null"
                >
                    Inbox
                </x-filament::button>

                <a
                    href="{{ $links['site'] }}"
                    target="_blank"
                    rel="noopener"
                    class="ms-1 inline-flex items-center gap-1 text-sm font-medium text-(--hf-text-soft) transition-colors hover:text-(--hf-accent)"
                >
                    View the site
                    <x-filament::icon :icon="Heroicon::ArrowUpRight" class="size-3.5" />
                </a>
            </div>
        </div>

        {{-- The living room from the home page, by day or by lamplight. --}}
        <div class="relative hidden min-h-44 md:block">
            <img
                src="{{ asset($isNight ? 'images/potted-plant-table-night-w1535.webp' : 'images/potted-plant-table-w2400.webp') }}"
                alt=""
                loading="eager"
                decoding="async"
                class="absolute inset-0 size-full object-cover"
            />
            <div
                class="absolute inset-0"
                style="background: linear-gradient(90deg, var(--hf-card) 0%, transparent 38%)"
            ></div>
        </div>
    </div>
</x-filament-widgets::widget>
