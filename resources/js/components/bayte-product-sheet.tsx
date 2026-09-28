import { Check, Plus, X } from 'lucide-react';
import { useEffect, useId, useRef } from 'react';
import { SmartImage } from '@/components/smart-image';
import { bayteSelection, useIsSelected } from '@/lib/bayte-selection';
import { cn } from '@/lib/utils';

interface BayteProductSheetProps {
    open: boolean;
    onClose: () => void;
    slug: string;
    name: string;
    description: string;
    /** Product cutout — transparent background works best on the panel. */
    src: string;
}

/**
 * A BAYTÉ piece up close: the cutout, its name and full description, and the
 * button that adds it to the visitor's selection. It opens the way the
 * selection does — a sheet from the bottom on a phone, a drawer from the
 * right on a tablet up — so the two panels feel like one family.
 */
export default function BayteProductSheet({
    open,
    onClose,
    slug,
    name,
    description,
    src,
}: BayteProductSheetProps) {
    const dialog = useRef<HTMLDialogElement>(null);
    const titleId = useId();
    const selected = useIsSelected(slug);

    useEffect(() => {
        const panel = dialog.current;

        if (open && !panel?.open) {
            panel?.showModal();
        } else if (!open && panel?.open) {
            panel.close();
        }

        if (!open) {
            return;
        }

        // The page behind the panel stays put while it is open.
        const root = document.documentElement;
        const overflow = root.style.overflow;
        root.style.overflow = 'hidden';

        return () => {
            root.style.overflow = overflow;
        };
    }, [open]);

    const toggle = () =>
        bayteSelection.toggle({ slug, name, description, image: src });

    return (
        <dialog
            ref={dialog}
            aria-labelledby={titleId}
            onClose={onClose}
            // A tap on the backdrop lands on the dialog element itself.
            onClick={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
            className={cn(
                // A phone: a sheet from the bottom.
                'fixed inset-x-0 top-auto bottom-0 m-0 flex max-h-[88dvh] w-full max-w-none translate-y-full flex-col rounded-t-3xl bg-white p-0 font-display text-ink shadow-[0_-20px_50px_-30px_rgb(26_22_20/0.5)] open:translate-y-0 starting:open:translate-y-full',
                // A tablet up: a drawer from the right.
                'md:inset-y-0 md:right-0 md:left-auto md:h-dvh md:max-h-none md:w-[27rem] md:translate-x-full md:translate-y-0 md:rounded-t-none md:rounded-l-3xl md:open:translate-x-0 md:starting:open:translate-x-full md:starting:open:translate-y-0',
                'transition-[translate,display,overlay] transition-discrete duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] not-open:hidden backdrop:bg-ink/40 motion-reduce:transition-none',
            )}
        >
            <span
                aria-hidden="true"
                className="mx-auto mt-2.5 block h-1 w-10 shrink-0 rounded-full bg-ink/15 md:hidden"
            />

            <div className="flex shrink-0 justify-end px-3 pt-1 md:px-4 md:pt-4">
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className="grid size-10 place-items-center rounded-full text-ink/60 transition-colors hover:bg-ink/5 hover:text-ink focus-visible:outline-2 focus-visible:outline-brand"
                >
                    <X className="size-5" strokeWidth={1.75} />
                </button>
            </div>

            <div className="min-h-0 flex-1 [scrollbar-width:thin] overflow-y-auto overscroll-contain px-5 md:px-7">
                <div className="relative aspect-4/3 w-full rounded-2xl bg-surface">
                    <SmartImage
                        src={src}
                        alt={name}
                        className="absolute inset-0 scale-[0.82]"
                        imgClassName="object-contain"
                        placeholderClassName="bg-transparent"
                    />
                </div>

                <h2 id={titleId} className="mt-6 text-2xl leading-tight">
                    {name}
                </h2>
                <p className="mt-3 pb-6 font-sans text-[15px] leading-relaxed whitespace-pre-line text-ink/70">
                    {description}
                </p>
            </div>

            <footer className="shrink-0 border-t border-ink/8 px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] md:px-7 md:pb-7">
                <button
                    type="button"
                    onClick={toggle}
                    aria-pressed={selected}
                    className={cn(
                        'flex min-h-12 w-full items-center justify-center gap-2.5 rounded-xl px-6 font-sans text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
                        selected
                            ? 'border border-ink/15 text-ink hover:border-ink/40'
                            : 'bg-brand text-brand-foreground hover:bg-brand-hover',
                    )}
                >
                    {selected ? (
                        <>
                            <Check className="size-4" strokeWidth={2.5} />
                            Remove from your selection
                        </>
                    ) : (
                        <>
                            <Plus className="size-4" strokeWidth={2.5} />
                            Add to your selection
                        </>
                    )}
                </button>
            </footer>
        </dialog>
    );
}
