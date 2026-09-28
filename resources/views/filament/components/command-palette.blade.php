@php
    $palette = \App\Filament\Support\CommandPalette::build();
@endphp

{{--
    The ⌘K palette: jump to any page, open any project or piece by name,
    start a new record, visit the site or switch the theme, from the keyboard.
    Everything is filtered in the browser, so results appear as you type.
--}}
<div
    x-data="{
        open: false,
        query: '',
        active: 0,
        returnFocus: null,
        commands: @js($palette['commands']),
        icons: @js($palette['icons']),
        groupOrder: ['Go to', 'Projects', 'BAYTÉ pieces', 'Curtain projects', 'Create', 'The site', 'Appearance'],

        normalize(text) {
            return (text ?? '').toString().normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
        },

        get results() {
            const terms = this.normalize(this.query).split(/\s+/).filter(Boolean)

            return this.commands
                .filter((command) => {
                    if (terms.length === 0) {
                        return ! command.searchOnly
                    }

                    const haystack = this.normalize([command.label, command.hint, command.group].join(' '))

                    return terms.every((term) => haystack.includes(term))
                })
                .map((command) => ({
                    ...command,
                    // Names that start with what was typed come first in their group.
                    score: terms.length && this.normalize(command.label).startsWith(terms[0]) ? 1 : 0,
                }))
                .sort((a, b) =>
                    this.groupOrder.indexOf(a.group) - this.groupOrder.indexOf(b.group) || b.score - a.score,
                )
                .slice(0, 60)
        },

        show() {
            this.returnFocus = document.activeElement
            this.query = ''
            this.active = 0
            this.open = true
            this.$nextTick(() => this.$refs.input.focus())
        },

        hide() {
            this.open = false
            this.returnFocus?.focus?.()
        },

        move(step) {
            const count = this.results.length

            if (count === 0) {
                return
            }

            this.active = (this.active + step + count) % count
            this.$nextTick(() => this.$refs.list.querySelector('[data-active]')?.scrollIntoView({ block: 'nearest' }))
        },

        run(command) {
            if (! command) {
                return
            }

            this.hide()

            if (command.theme) {
                window.dispatchEvent(new CustomEvent('theme-changed', { detail: command.theme }))

                return
            }

            if (command.newTab) {
                window.open(command.url, '_blank', 'noopener')

                return
            }

            window.Livewire?.navigate ? window.Livewire.navigate(command.url) : (window.location.href = command.url)
        },
    }"
    x-on:keydown.meta.k.window.prevent="open ? hide() : show()"
    x-on:keydown.ctrl.k.window.prevent="open ? hide() : show()"
    x-on:open-command-palette.window="show()"
    x-effect="query; active = 0"
    class="hf-palette"
>
    <template x-teleport="body">
        <div
            x-show="open"
            x-cloak
            x-on:keydown.escape.prevent.stop="hide()"
            class="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[12vh]"
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
        >
            {{-- The room behind, dimmed. --}}
            <div
                x-show="open"
                x-transition.opacity.duration.150ms
                x-on:click="hide()"
                class="absolute inset-0 bg-(--hf-scrim) backdrop-blur-[2px]"
            ></div>

            <div
                x-show="open"
                x-transition:enter="transition duration-200 ease-out"
                x-transition:enter-start="opacity-0 -translate-y-2 scale-[0.98]"
                x-transition:enter-end="opacity-100 translate-y-0 scale-100"
                x-transition:leave="transition duration-100 ease-in"
                x-transition:leave-start="opacity-100"
                x-transition:leave-end="opacity-0"
                class="relative w-full max-w-xl overflow-hidden rounded-2xl bg-(--hf-sheet) shadow-[0_30px_80px_-24px_rgb(26_22_20/0.55)] ring-1 ring-(--hf-line-strong)"
            >
                <div class="flex items-center gap-3 border-b border-(--hf-line) px-4">
                    <x-filament::icon
                        :icon="\Filament\Support\Icons\Heroicon::OutlinedMagnifyingGlass"
                        class="size-5 shrink-0 text-(--hf-text-faint)"
                    />
                    <input
                        x-ref="input"
                        x-model="query"
                        x-on:keydown.arrow-down.prevent="move(1)"
                        x-on:keydown.arrow-up.prevent="move(-1)"
                        x-on:keydown.enter.prevent="run(results[active])"
                        type="text"
                        role="combobox"
                        aria-expanded="true"
                        aria-controls="hf-palette-list"
                        aria-autocomplete="list"
                        autocomplete="off"
                        spellcheck="false"
                        placeholder="Search pages, projects, BAYTÉ pieces…"
                        class="h-13 w-full border-0 bg-transparent p-0 text-base text-(--hf-text) outline-none placeholder:text-(--hf-text-faint) focus:ring-0"
                    />
                    <kbd class="rounded-md px-1.5 py-0.5 text-[0.68rem] font-medium text-(--hf-text-faint) ring-1 ring-(--hf-line-strong)">
                        esc
                    </kbd>
                </div>

                <ul
                    x-ref="list"
                    id="hf-palette-list"
                    role="listbox"
                    class="max-h-[min(58vh,26rem)] overflow-y-auto overscroll-contain p-1.5"
                >
                    <template x-for="(command, index) in results" :key="command.group + command.label + index">
                        <li role="presentation">
                            <p
                                x-show="index === 0 || results[index - 1].group !== command.group"
                                x-text="command.group"
                                class="px-2.5 pt-2.5 pb-1 text-[0.7rem] font-medium text-(--hf-text-faint)"
                            ></p>
                            <button
                                type="button"
                                role="option"
                                x-bind:aria-selected="index === active"
                                x-bind:data-active="index === active ? true : null"
                                x-on:mousemove="active = index"
                                x-on:click="run(command)"
                                x-bind:class="index === active ? 'bg-(--hf-hover) text-(--hf-text)' : 'text-(--hf-text-soft)'"
                                class="group flex w-full items-center gap-3 rounded-[9px] px-2.5 py-2 text-start text-sm transition-colors"
                            >
                                <span
                                    class="grid size-7 shrink-0 place-items-center rounded-[7px] bg-(--hf-inset) text-(--hf-text-faint) ring-1 ring-(--hf-line) [&_svg]:size-4"
                                    x-bind:class="index === active && 'text-(--hf-accent)'"
                                    x-html="icons[command.icon] ?? ''"
                                ></span>
                                <span class="min-w-0 flex-1 truncate font-medium" x-text="command.label"></span>
                                <span class="shrink-0 truncate text-xs text-(--hf-text-faint)" x-text="command.hint ?? ''"></span>
                                <span
                                    x-show="index === active"
                                    class="shrink-0 text-xs text-(--hf-text-faint)"
                                    aria-hidden="true"
                                >↵</span>
                            </button>
                        </li>
                    </template>

                    <li x-show="results.length === 0" class="px-3 py-10 text-center text-sm text-(--hf-text-faint)">
                        Nothing matches “<span x-text="query"></span>”.
                    </li>
                </ul>

                <div class="flex items-center gap-4 border-t border-(--hf-line) bg-(--hf-inset) px-4 py-2 text-[0.7rem] text-(--hf-text-faint)">
                    <span><kbd class="font-sans">↑↓</kbd> move</span>
                    <span><kbd class="font-sans">↵</kbd> open</span>
                    <span class="ms-auto">Type a project or piece name to find it</span>
                </div>
            </div>
        </div>
    </template>
</div>
