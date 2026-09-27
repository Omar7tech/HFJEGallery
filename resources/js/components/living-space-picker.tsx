import { useId } from 'react';
import MaskedIcon from '@/components/masked-icon';
import { cn } from '@/lib/utils';
import type { LivingSpace } from '@/types';

interface LivingSpacePickerProps {
    spaces: LivingSpace[];
    /** The space picked, or null. */
    selectedId: string | null;
    onSelect: (id: string) => void;
    /** Moves on to the first step with the picked space. */
    onNext: () => void;
    /** The title's heading level: the page title, or a section of a page. */
    titleAs?: 'h1' | 'h2';
}

/**
 * The first step of the Living Edit: a card to choose a space, then NEXT.
 * Shared by the Living Edit page and its section on the home page.
 */
export default function LivingSpacePicker({
    spaces,
    selectedId,
    onSelect,
    onNext,
    titleAs: Title = 'h1',
}: LivingSpacePickerProps) {
    // Each picker's radios form their own group.
    const group = useId();

    return (
        <div className="mx-auto flex min-h-[630px] w-full flex-col items-center rounded-[30px] bg-pill px-5 pt-8 pb-9 font-display text-[#171915] shadow-[0_3px_12px_rgba(0,0,0,0.12)] sm:px-10 sm:pt-10">
            <Title className="text-center text-[clamp(1.5rem,3.4vw,2.25rem)] leading-[1.4] tracking-[-0.045em]">
                The Living Edit
            </Title>

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
                                name={group}
                                value={id}
                                checked={selectedId === id}
                                onChange={() => onSelect(id)}
                                className="peer sr-only"
                            />
                            <span
                                className={cn(
                                    '@container flex aspect-[1.6] w-full items-center justify-center rounded-[20px] border border-white/65 shadow-[0_3px_4px_rgba(0,0,0,0.16)] transition-[background-color,border-color,color,scale] duration-300 ease-out peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-brand motion-safe:group-active:scale-[0.98] motion-reduce:transition-none',
                                    selectedId === id
                                        ? 'border-brand bg-brand text-pill'
                                        : 'bg-pill text-brand group-hover:bg-pill-hover',
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
                onClick={onNext}
                disabled={!selectedId}
                className="mt-auto min-h-10 w-full max-w-[284px] rounded-full bg-brand px-6 py-1.5 text-center text-xl leading-tight text-white transition-[background-color,scale] duration-300 ease-out hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand disabled:cursor-default disabled:hover:bg-brand motion-safe:active:scale-[0.98] motion-reduce:transition-none max-sm:mt-10"
            >
                NEXT
            </button>
        </div>
    );
}
