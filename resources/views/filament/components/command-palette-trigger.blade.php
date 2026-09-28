{{-- Opens the ⌘K palette from the top of the sidebar. --}}
<button
    type="button"
    x-data="{ mac: /Mac|iPhone|iPad/.test(navigator.platform) }"
    x-show="$store.sidebar.isOpen"
    x-on:click="$dispatch('open-command-palette')"
    class="mb-1 flex w-full items-center gap-2.5 rounded-[9px] bg-(--hf-chip) px-2.5 py-2 text-start text-sm text-(--hf-text-faint) ring-1 ring-(--hf-line) transition-colors hover:text-(--hf-text-soft) hover:ring-(--hf-line-strong)"
>
    <x-filament::icon
        :icon="\Filament\Support\Icons\Heroicon::OutlinedMagnifyingGlass"
        class="size-4 shrink-0"
    />
    <span class="flex-1 truncate">Search or jump to…</span>
    <kbd
        class="rounded-md px-1.5 py-0.5 font-sans text-[0.68rem] font-medium ring-1 ring-(--hf-line-strong)"
        x-text="mac ? '⌘K' : 'Ctrl K'"
    >⌘K</kbd>
</button>
