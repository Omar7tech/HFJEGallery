import { Link } from '@inertiajs/react';
import { RefreshCw } from 'lucide-react';
import MarqueeText from '@/components/marquee-text';
import { cn } from '@/lib/utils';
import type { LivingEditOption, LivingSpace, MoodBoardSlot } from '@/types';
import MaskedIcon from './masked-icon';
import MoodBoardPreview from './mood-board-preview';
import {
    LIVING_EDIT_STEPS,
    LIVING_EDIT_TOTAL_STEPS,
    MAX_STEP_SELECTIONS,
} from './use-living-edit-flow';
import type { LivingEditStep } from './use-living-edit-flow';
import type { MoodBoardStatus } from './use-mood-board';

const STEP_COPY: Record<LivingEditStep, { legend: string; pickHint: string }> =
    {
        'step-1': {
            legend: 'Choose your feelings. Select up to three.',
            pickHint: 'pick a feeling',
        },
        'step-2': {
            legend: 'Choose your moments. Select up to three.',
            pickHint: 'pick a moment',
        },
        'step-3': {
            legend: 'Choose your materials. Select up to three.',
            pickHint: 'pick a material',
        },
        'step-4': {
            legend: 'Choose your palette. Select up to three.',
            pickHint: 'pick a palette',
        },
    };

const REFRESH_LABELS: Record<MoodBoardStatus, string> = {
    locked: '',
    loading: 'Updating',
    ready: 'Refresh Board',
    stale: 'Update Board',
    failed: 'Try Again',
};

/** Joins names as "A", "A & B" or "A, B & C". */
function joinNames(names: string[]): string {
    return names.length > 1
        ? `${names.slice(0, -1).join(', ')} & ${names.at(-1)}`
        : (names[0] ?? '');
}

export default function LivingMoodBoard({
    step,
    space,
    options,
    selected,
    onToggle,
    onBack,
    onContinue,
    board,
}: {
    step: LivingEditStep;
    space: LivingSpace;
    options: LivingEditOption[];
    selected: string[];
    onToggle: (id: string) => void;
    onBack: () => void;
    onContinue?: () => void;
    board: {
        slots: MoodBoardSlot[] | null;
        status: MoodBoardStatus;
        refresh: () => void;
    };
}) {
    const stepNumber = LIVING_EDIT_STEPS.indexOf(step) + 1;

    const selectedNames = selected
        .map((id) => options.find((option) => option.id === id)?.name)
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
                <p className="max-w-[380px] font-display text-[clamp(0.6875rem,1.3cqi,0.8125rem)] leading-[1.6] text-[#b56c49] @2xl:pt-0.5">
                    Choose The Feelings, Moments, And Materials That Feel Like
                    Home. Your Selections Are Matched With Visual Directions
                    Curated By HFJE.
                </p>
            </header>

            <div className="mt-10 grid items-start gap-10 @2xl:grid-cols-[minmax(0,1.04fr)_minmax(0,1fr)]">
                <div className="min-w-0 pt-2 font-sans">
                    <h2 className="text-xl leading-6">
                        STEP {stepNumber} OF {LIVING_EDIT_TOTAL_STEPS}
                    </h2>
                    <div
                        className="mt-5 grid grid-cols-4 gap-2"
                        aria-label={`Step ${stepNumber} of ${LIVING_EDIT_TOTAL_STEPS}`}
                    >
                        {Array.from(
                            { length: LIVING_EDIT_TOTAL_STEPS },
                            (_, index) => index,
                        ).map((index) => (
                            <span
                                key={index}
                                className={cn(
                                    'h-px',
                                    index < stepNumber
                                        ? 'bg-[#b56c49]'
                                        : 'bg-[#ead4c9]',
                                )}
                            />
                        ))}
                    </div>
                    <fieldset className="mt-7">
                        <legend className="sr-only">
                            {STEP_COPY[step].legend}
                        </legend>
                        {options.length === 0 && (
                            <p className="text-[10px] text-[#777]">
                                Options for this step are coming soon.
                            </p>
                        )}
                        <div className="grid grid-cols-4 gap-2">
                            {options.map(({ id, name, icon }) => (
                                <button
                                    key={id}
                                    type="button"
                                    aria-pressed={selected.includes(id)}
                                    disabled={
                                        !selected.includes(id) &&
                                        selected.length >= MAX_STEP_SELECTIONS
                                    }
                                    onClick={() => onToggle(id)}
                                    className={cn(
                                        'flex aspect-square min-w-0 flex-col items-center justify-center gap-[8%] rounded-xl p-2 text-center text-[clamp(0.625rem,1.5cqi,0.8125rem)] leading-none transition-[background-color,color,opacity,scale] duration-300 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-default disabled:opacity-60 motion-safe:enabled:active:scale-[0.97] motion-reduce:transition-none',
                                        selected.includes(id)
                                            ? 'bg-[#ad6844] text-white'
                                            : 'bg-[#f3f3f3] text-[#ad6844] enabled:hover:bg-[#ece7e3]',
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
                        Select Up To {MAX_STEP_SELECTIONS}
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
                            onClick={onContinue}
                            disabled={!onContinue || selected.length === 0}
                            title={
                                onContinue
                                    ? undefined
                                    : 'The next step is coming soon'
                            }
                            className="min-h-9 rounded-lg bg-[#ad6844] px-6 py-1.5 text-[clamp(0.8125rem,1.5cqi,0.9375rem)] text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand enabled:hover:bg-brand-hover disabled:cursor-default"
                        >
                            Continue
                        </button>
                    </div>
                </div>

                <div className="min-w-0 font-sans">
                    <div className="flex min-h-9 items-end justify-between gap-2">
                        <div className="min-w-0 flex-1">
                            <p className="text-[9px] leading-tight">
                                Mood Pack X · Live Preview
                            </p>
                            <h2
                                aria-live="polite"
                                className="truncate text-base leading-tight capitalize"
                            >
                                {selectedNames.length > 0 ? (
                                    <MarqueeText>
                                        {`${joinNames(selectedNames)} ${space.name}`}
                                    </MarqueeText>
                                ) : (
                                    <>
                                        {space.name}{' '}
                                        <span className="text-[#999] normal-case">
                                            · {STEP_COPY[step].pickHint}
                                        </span>
                                    </>
                                )}
                            </h2>
                        </div>
                        {board.status !== 'locked' && (
                            <button
                                type="button"
                                onClick={board.refresh}
                                disabled={board.status === 'loading'}
                                title={
                                    board.status === 'ready'
                                        ? 'Show other matching images'
                                        : undefined
                                }
                                className={cn(
                                    'flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[9px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-default',
                                    board.status === 'stale'
                                        ? 'bg-[#ad6844] text-white hover:bg-brand-hover'
                                        : 'bg-[#f4f4f4] text-[#ad6844] enabled:hover:bg-[#ece7e3]',
                                )}
                            >
                                <RefreshCw
                                    aria-hidden="true"
                                    size={15}
                                    className={cn(
                                        board.status === 'loading' &&
                                            'motion-safe:animate-spin',
                                    )}
                                />{' '}
                                {REFRESH_LABELS[board.status]}
                            </button>
                        )}
                    </div>

                    <MoodBoardPreview
                        slots={board.slots}
                        status={board.status}
                        lastStepNumber={LIVING_EDIT_TOTAL_STEPS}
                        onRefresh={board.refresh}
                    />
                    <div className="mt-9 flex justify-center">
                        <button
                            type="button"
                            disabled
                            title="Saving the board is coming soon"
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
