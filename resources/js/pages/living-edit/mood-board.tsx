import { Link } from '@inertiajs/react';
import { RefreshCw } from 'lucide-react';
import MarqueeText from '@/components/marquee-text';
import { cn } from '@/lib/utils';
import type { LivingSpace } from '@/types';
import MaskedIcon from './masked-icon';
import {
    LIVING_EDIT_STEPS,
    LIVING_EDIT_TOTAL_STEPS,
    MAX_FEELINGS,
} from './use-living-edit-flow';

const STEP_NUMBER = LIVING_EDIT_STEPS.indexOf('feelings') + 1;

/** Joins names as "A", "A & B" or "A, B & C". */
function joinNames(names: string[]): string {
    return names.length > 1
        ? `${names.slice(0, -1).join(', ')} & ${names.at(-1)}`
        : (names[0] ?? '');
}

export default function LivingMoodBoard({
    space,
    selected,
    onToggle,
    onBack,
}: {
    space: LivingSpace;
    selected: string[];
    onToggle: (id: string) => void;
    onBack: () => void;
}) {
    const { feelings } = space;
    const selectedNames = selected
        .map((id) => feelings.find((feeling) => feeling.id === id)?.name)
        .filter((name): name is string => Boolean(name));

    return (
        <section className="@container px-5 pt-9 pb-8 text-[#191b17] md:px-8 lg:pt-[52px] lg:pr-8 lg:pl-0">
            <header className="grid gap-5 border-b border-[#bd7959] pb-6 @2xl:grid-cols-[1.04fr_1fr] @2xl:gap-10">
                <div className="font-display">
                    <p className="text-[clamp(0.7rem,2.5cqi,1rem)] leading-relaxed whitespace-nowrap">
                        HFJE LIVING COLLECTIONS
                    </p>
                    <h1 className="mt-2 text-[clamp(1.3rem,3.6cqi,1.65rem)] leading-relaxed tracking-[-0.03em]">
                        The Living Edit
                    </h1>
                </div>
                <p className="max-w-[340px] font-display text-[10px] leading-[1.55] text-[#b56c49] @2xl:pt-0.5">
                    Choose The Feelings, Moments, And Materials That Feel Like
                    Home. Your Selections Are Matched With Visual Directions
                    Curated By HFJE.
                </p>
            </header>

            <div className="mt-10 grid items-start gap-10 @2xl:grid-cols-[1.04fr_1fr]">
                <div className="pt-2 font-sans">
                    <h2 className="text-xl leading-6">
                        STEP {STEP_NUMBER} OF {LIVING_EDIT_TOTAL_STEPS}
                    </h2>
                    <div
                        className="mt-5 grid grid-cols-4 gap-2"
                        aria-label={`Step ${STEP_NUMBER} of ${LIVING_EDIT_TOTAL_STEPS}`}
                    >
                        {Array.from(
                            { length: LIVING_EDIT_TOTAL_STEPS },
                            (_, step) => step,
                        ).map((step) => (
                            <span
                                key={step}
                                className={cn(
                                    'h-px',
                                    step < STEP_NUMBER
                                        ? 'bg-[#b56c49]'
                                        : 'bg-[#ead4c9]',
                                )}
                            />
                        ))}
                    </div>
                    <fieldset className="mt-7">
                        <legend className="sr-only">
                            Choose your feelings. Select up to three.
                        </legend>
                        {feelings.length === 0 && (
                            <p className="text-[10px] text-[#777]">
                                Feelings for this space are coming soon.
                            </p>
                        )}
                        <div className="grid grid-cols-4 gap-2">
                            {feelings.map(({ id, name, icon }) => (
                                <button
                                    key={id}
                                    type="button"
                                    aria-pressed={selected.includes(id)}
                                    disabled={
                                        !selected.includes(id) &&
                                        selected.length >= MAX_FEELINGS
                                    }
                                    onClick={() => onToggle(id)}
                                    className={cn(
                                        'flex aspect-square min-w-0 flex-col items-center justify-center gap-[8%] rounded-xl p-2 text-center text-[clamp(0.625rem,1.5cqi,0.8125rem)] leading-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-default disabled:opacity-60',
                                        selected.includes(id)
                                            ? 'bg-[#ad6844] text-white'
                                            : 'bg-[#f3f3f3] text-[#ad6844]',
                                    )}
                                >
                                    <MarqueeText className="w-full leading-normal">
                                        {name}
                                    </MarqueeText>
                                    {icon && (
                                        <MaskedIcon
                                            src={icon}
                                            className="aspect-square w-[62%] shrink-0"
                                        />
                                    )}
                                </button>
                            ))}
                        </div>
                    </fieldset>
                    <p className="mt-8 border-b border-[#bd7959] pb-2 text-[clamp(0.75rem,1.4cqi,0.875rem)]">
                        Select Up To {MAX_FEELINGS}
                    </p>
                    <div className="mt-5 flex items-center justify-between px-2">
                        <button
                            type="button"
                            onClick={onBack}
                            className="min-h-9 px-1 text-[clamp(0.8125rem,1.5cqi,0.9375rem)] text-[#777] transition-colors hover:text-brand focus-visible:outline-brand"
                        >
                            Back
                        </button>
                        <button
                            type="button"
                            disabled
                            title="The next step is coming soon"
                            className="min-h-9 rounded-lg bg-[#ad6844] px-6 py-1.5 text-[clamp(0.8125rem,1.5cqi,0.9375rem)] text-white disabled:cursor-default"
                        >
                            Continue
                        </button>
                    </div>
                </div>

                <div className="font-sans">
                    <div className="flex min-h-9 items-end justify-between gap-2">
                        <div>
                            <p className="text-[9px] leading-tight">
                                Mood Pack X · Live Preview
                            </p>
                            <h2
                                aria-live="polite"
                                className="text-base leading-tight capitalize"
                            >
                                {selectedNames.length > 0 ? (
                                    `${joinNames(selectedNames)} ${space.name}`
                                ) : (
                                    <>
                                        {space.name}{' '}
                                        <span className="text-[#999] normal-case">
                                            · pick a feeling
                                        </span>
                                    </>
                                )}
                            </h2>
                        </div>
                        <button
                            type="button"
                            disabled
                            title="Available when mood-board images are connected"
                            className="flex shrink-0 items-center gap-1 rounded-full bg-[#f4f4f4] px-2 py-1 text-[9px] text-[#ad6844] disabled:cursor-default"
                        >
                            <RefreshCw aria-hidden="true" size={15} /> Refresh
                            Board
                        </button>
                    </div>

                    <div
                        role="img"
                        aria-label="Mood board with gray image placeholders and brown and beige color swatches"
                        className="mt-6 grid aspect-square grid-cols-[1.1fr_1fr] gap-1.5"
                    >
                        <div className="rounded-xl bg-[#d9d9d9]" />
                        <div className="grid min-h-0 grid-rows-[1.65fr_1fr_0.7fr] gap-1.5">
                            <div className="rounded-xl bg-[#dedede]" />
                            <div className="grid grid-cols-[2fr_1fr] gap-1">
                                <div className="rounded-xl bg-[#6c4936]" />
                                <div className="rounded-xl bg-[#d6c2a6]" />
                            </div>
                            <div className="grid grid-cols-3 gap-1">
                                <div className="rounded-lg bg-[#d1d1d1]" />
                                <div className="rounded-lg bg-[#e4e4e4]" />
                                <div className="rounded-lg bg-[#d8d8d8]" />
                            </div>
                        </div>
                    </div>
                    <div className="mt-9 flex justify-center">
                        <button
                            type="button"
                            disabled
                            title="Available when mood-board images are connected"
                            className="w-[136px] rounded-full bg-[#f4f4f4] py-0.5 text-xs text-[#ad6844] disabled:cursor-default"
                        >
                            Save Image
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-[50px] flex justify-center">
                <Link
                    href="/contact"
                    className="rounded-full bg-[#ad6844] px-6 py-3 font-display text-[11px] text-white transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
                >
                    Book a Consulting Call
                </Link>
            </div>
        </section>
    );
}
