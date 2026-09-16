import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { LivingSpace } from '@/types';
import MaskedIcon from './masked-icon';
import LivingMoodBoard from './mood-board';

export default function LivingEdit({ spaces }: { spaces: LivingSpace[] }) {
    const [selectedSpaceId, setSelectedSpaceId] = useState(
        spaces[0]?.id ?? null,
    );
    const [showMoodBoard, setShowMoodBoard] = useState(false);
    const selectedSpace = spaces.find((space) => space.id === selectedSpaceId);

    if (showMoodBoard && selectedSpace) {
        return (
            <>
                <Head title="Living Edit" />
                <LivingMoodBoard
                    key={selectedSpace.id}
                    space={selectedSpace}
                    onBack={() => setShowMoodBoard(false)}
                />
            </>
        );
    }

    return (
        <>
            <Head title="Living Edit" />

            <section className="w-full px-4 pt-6 pb-4 font-display md:px-8 lg:pt-7 lg:pr-7 lg:pl-0">
                <div className="mx-auto flex min-h-[630px] w-full flex-col items-center rounded-[30px] bg-[#f4f4f4] px-5 pt-8 pb-9 text-[#171915] shadow-[0_3px_12px_rgba(0,0,0,0.12)] sm:px-10 sm:pt-7">
                    <h1 className="text-center text-[clamp(1.5rem,3.4vw,2.25rem)] leading-[1.4] tracking-[-0.045em]">
                        The Living Edit
                    </h1>

                    <fieldset className="mt-2 w-full max-w-[484px] min-w-0">
                        <legend className="w-full text-center text-[clamp(0.7rem,1.6vw,1.05rem)] leading-relaxed uppercase">
                            Choose your space
                        </legend>

                        {spaces.length === 0 && (
                            <p className="mt-10 text-center text-sm text-[#777] sm:mt-14">
                                Spaces are being curated. Check back soon.
                            </p>
                        )}

                        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-4 sm:mt-14 sm:gap-x-10">
                            {spaces.map(({ id, name, icon }) => (
                                <label
                                    key={id}
                                    className="group flex min-w-0 cursor-pointer flex-col items-center"
                                >
                                    <input
                                        type="radio"
                                        name="space"
                                        value={id}
                                        checked={selectedSpaceId === id}
                                        onChange={() => setSelectedSpaceId(id)}
                                        className="peer sr-only"
                                    />
                                    <span
                                        className={cn(
                                            'flex aspect-[1.6] w-full items-center justify-center rounded-[20px] border border-white/65 shadow-[0_3px_4px_rgba(0,0,0,0.16)] transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-brand motion-reduce:transition-none',
                                            selectedSpaceId === id
                                                ? 'border-[#ad6844] bg-[#ad6844] text-[#f4f4f4]'
                                                : 'bg-[#f4f4f4] text-[#ad6844] group-hover:bg-[#ece7e3]',
                                        )}
                                    >
                                        {icon && (
                                            <MaskedIcon
                                                src={icon}
                                                className="h-[58%] w-[58%]"
                                            />
                                        )}
                                    </span>
                                    <span className="mt-3 text-center text-[clamp(0.55rem,1.1vw,0.75rem)] leading-relaxed uppercase">
                                        {name}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </fieldset>

                    <button
                        type="button"
                        onClick={() => setShowMoodBoard(true)}
                        disabled={!selectedSpace}
                        className="mt-auto min-h-10 w-full max-w-[284px] rounded-full bg-[#ad6844] px-6 py-1.5 text-center text-xl leading-tight text-white disabled:cursor-default max-sm:mt-10"
                    >
                        NEXT
                    </button>
                </div>
            </section>
        </>
    );
}
