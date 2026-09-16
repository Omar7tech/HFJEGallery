import { Head } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import type { LivingSpace } from '@/types';
import MaskedIcon from './masked-icon';
import LivingMoodBoard from './mood-board';
import { useLivingEditFlow } from './use-living-edit-flow';

export default function LivingEdit({ spaces }: { spaces: LivingSpace[] }) {
    const { space, step, feelingIds, goTo, selectSpace, toggleFeeling } =
        useLivingEditFlow(spaces);

    if (space && step === 'feelings') {
        return (
            <>
                <Head title="Living Edit" />
                <LivingMoodBoard
                    space={space}
                    selected={feelingIds}
                    onToggle={toggleFeeling}
                    onBack={() => goTo(null)}
                />
            </>
        );
    }

    return (
        <>
            <Head title="Living Edit" />

            <section className="w-full px-4 pt-9 pb-4 font-display md:px-8 lg:pt-[52px] lg:pr-7 lg:pl-0">
                <div className="mx-auto flex min-h-[630px] w-full flex-col items-center rounded-[30px] bg-[#f4f4f4] px-5 pt-8 pb-9 text-[#171915] shadow-[0_3px_12px_rgba(0,0,0,0.12)] sm:px-10 sm:pt-10">
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
                                        checked={space?.id === id}
                                        onChange={() => selectSpace(id)}
                                        className="peer sr-only"
                                    />
                                    <span
                                        className={cn(
                                            '@container flex aspect-[1.6] w-full items-center justify-center rounded-[20px] border border-white/65 shadow-[0_3px_4px_rgba(0,0,0,0.16)] transition-[background-color,border-color,color,scale] duration-300 ease-out peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-brand motion-safe:group-active:scale-[0.98] motion-reduce:transition-none',
                                            space?.id === id
                                                ? 'border-[#ad6844] bg-[#ad6844] text-[#f4f4f4]'
                                                : 'bg-[#f4f4f4] text-[#ad6844] group-hover:bg-[#ece7e3]',
                                        )}
                                    >
                                        {icon ? (
                                            <MaskedIcon
                                                src={icon}
                                                className="h-[58%] w-[58%]"
                                            />
                                        ) : (
                                            <span className="px-[8cqi] text-center text-[clamp(0.7rem,7.5cqi,1.2rem)] leading-snug tracking-[0.04em] text-balance uppercase">
                                                {name}
                                            </span>
                                        )}
                                    </span>
                                    <span
                                        aria-hidden={!icon}
                                        className={cn(
                                            'mt-3 text-center text-[clamp(0.55rem,1.1vw,0.75rem)] leading-relaxed uppercase',
                                            !icon && 'invisible',
                                        )}
                                    >
                                        {name}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </fieldset>

                    <button
                        type="button"
                        onClick={() => goTo('feelings')}
                        disabled={!space}
                        className="mt-auto min-h-10 w-full max-w-[284px] rounded-full bg-[#ad6844] px-6 py-1.5 text-center text-xl leading-tight text-white transition-[background-color,scale] duration-300 ease-out hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand disabled:cursor-default disabled:hover:bg-[#ad6844] motion-safe:active:scale-[0.98] motion-reduce:transition-none max-sm:mt-10"
                    >
                        NEXT
                    </button>
                </div>
            </section>
        </>
    );
}
