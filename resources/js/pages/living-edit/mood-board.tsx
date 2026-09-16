import { Link } from '@inertiajs/react';
import { House, Leaf, RefreshCw, Sun, Amphora } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const feelings = [
    { id: 'warm', label: 'Warm', icon: Sun },
    { id: 'refined', label: 'Refined', icon: Amphora },
    { id: 'social', label: 'Social', icon: House },
    { id: 'grounded', label: 'Grounded', icon: Leaf },
    { id: 'expressive', label: 'Expressive' },
    { id: 'calm', label: 'Calm' },
    { id: 'grounded-soft', label: 'Grounded' },
];

export default function LivingMoodBoard({
    room,
    onBack,
}: {
    room: string;
    onBack: () => void;
}) {
    const [selected, setSelected] = useState(['warm', 'refined']);

    function toggleFeeling(id: string) {
        setSelected((current) =>
            current.includes(id)
                ? current.filter((value) => value !== id)
                : current.length < 3
                  ? [...current, id]
                  : current,
        );
    }

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
                    <h2 className="text-xl leading-6">STEP 1 OF 4</h2>
                    <div
                        className="mt-5 grid grid-cols-4 gap-2"
                        aria-label="Step 1 of 4"
                    >
                        {[0, 1, 2, 3].map((step) => (
                            <span
                                key={step}
                                className={cn(
                                    'h-px',
                                    step === 0
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
                        <div className="grid grid-cols-4 gap-2">
                            {feelings.map(({ id, label, icon: Icon }) => (
                                <button
                                    key={id}
                                    type="button"
                                    aria-pressed={selected.includes(id)}
                                    disabled={
                                        !selected.includes(id) &&
                                        selected.length >= 3
                                    }
                                    onClick={() => toggleFeeling(id)}
                                    className={cn(
                                        'flex aspect-square min-w-0 flex-col items-center rounded-xl px-1 py-2 text-[9px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-default disabled:opacity-60',
                                        selected.includes(id)
                                            ? 'bg-[#ad6844] text-white'
                                            : 'bg-[#f3f3f3] text-[#ad6844]',
                                        !Icon && 'justify-center',
                                    )}
                                >
                                    <span>{label}</span>
                                    {Icon && (
                                        <Icon
                                            aria-hidden="true"
                                            className="mt-1 h-9 w-9 max-w-[70%]"
                                            strokeWidth={1.6}
                                        />
                                    )}
                                </button>
                            ))}
                        </div>
                    </fieldset>
                    <p className="mt-8 border-b border-[#bd7959] pb-2 text-[9px]">
                        Select Up To 3
                    </p>
                    <div className="mt-5 flex items-center justify-between px-2">
                        <button
                            type="button"
                            onClick={onBack}
                            className="text-[10px] text-[#777] hover:text-brand focus-visible:outline-brand"
                        >
                            Back
                        </button>
                        <button
                            type="button"
                            disabled
                            title="The next step is coming soon"
                            className="rounded-lg bg-[#ad6844] px-5 py-1 text-[10px] text-white disabled:cursor-default"
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
                            <h2 className="text-base leading-tight">
                                {room}{' '}
                                {selected.includes('warm')
                                    ? 'Warm'
                                    : (feelings.find(
                                          (feeling) =>
                                              feeling.id === selected[0],
                                      )?.label ?? '')}{' '}
                                × Gather
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
