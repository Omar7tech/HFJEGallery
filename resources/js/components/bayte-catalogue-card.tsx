import { Check, Plus } from 'lucide-react';
import { useState } from 'react';
import BayteProductSheet from '@/components/bayte-product-sheet';
import BayteWordmark from '@/components/bayte-wordmark';
import { SmartImage } from '@/components/smart-image';
import { bayteSelection, useIsSelected } from '@/lib/bayte-selection';
import { cn } from '@/lib/utils';

interface BayteCatalogueCardProps {
    slug: string;
    name: string;
    description: string;
    /** Product cutout — transparent background works best on the card. */
    src: string;
}

/**
 * The catalogue version of the BAYTÉ card: the same face as the one on the
 * home page — name, description, badge, cutout and wordmark — but flat.
 *
 * The home card is a 3D object that leans toward the pointer; a grid of those
 * fights itself, so this one stays in the plane and answers the pointer with
 * a small, slow lift and the product drawing gently closer. The badge adds
 * the piece to the visitor's selection, and turns into a tick once it is in.
 */
export default function BayteCatalogueCard({
    slug,
    name,
    description,
    src,
}: BayteCatalogueCardProps) {
    const selected = useIsSelected(slug);
    const [detailsOpen, setDetailsOpen] = useState(false);

    return (
        <>
            <article
                onClick={() => setDetailsOpen(true)}
                className={cn(
                    'group flex cursor-pointer flex-col rounded-2xl bg-surface p-5 ring-1 ring-transparent transition-[background-color,box-shadow,translate] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:bg-surface-hover hover:shadow-[0_22px_44px_-30px_rgba(74,48,32,0.45)] motion-reduce:transition-none motion-reduce:hover:translate-y-0',
                    selected && 'ring-brand/35',
                )}
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <h3 className="text-xl leading-tight text-ink">
                            {/* Keyboard route to the details; a tap anywhere on
                            the card opens them too. */}
                            <button
                                type="button"
                                className="text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
                            >
                                {name}
                            </button>
                        </h3>
                        <p className="mt-2 line-clamp-2 text-xs leading-[1.5] text-ink/70">
                            {description}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={(event) => {
                            // The badge adds the piece; it doesn't open it.
                            event.stopPropagation();
                            bayteSelection.toggle({
                                slug,
                                name,
                                description,
                                image: src,
                            });
                        }}
                        aria-pressed={selected}
                        aria-label={
                            selected
                                ? `Remove ${name} from your selection`
                                : `Add ${name} to your selection`
                        }
                        // The dot stays small; the invisible ring around it
                        // gives a finger a full 44px to land on.
                        className={cn(
                            'relative grid size-7 shrink-0 place-items-center rounded-full bg-brand text-brand-foreground transition-colors duration-300 ease-out before:absolute before:-inset-2 before:content-[""] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand motion-reduce:transition-none',
                            selected
                                ? 'bg-ink hover:bg-ink/85'
                                : 'hover:bg-brand-hover',
                        )}
                    >
                        {selected ? (
                            <Check className="size-4" strokeWidth={2.5} />
                        ) : (
                            <Plus className="size-4" strokeWidth={2.5} />
                        )}
                    </button>
                </div>

                <div className="relative mt-4 aspect-3/2 w-full">
                    {/* Ground shadow, fading in with the lift so the cutout reads
                    as standing on the card rather than printed on it. */}
                    <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-x-10 bottom-1 h-4 rounded-[50%] bg-ink/25 opacity-0 blur-lg transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-100 motion-reduce:hidden"
                    />

                    <SmartImage
                        src={src}
                        alt={name}
                        className="absolute inset-0 scale-[0.84] transition-[scale] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[0.88] motion-reduce:transition-none motion-reduce:group-hover:scale-[0.84]"
                        imgClassName="object-contain"
                        placeholderClassName="bg-transparent"
                        loading="lazy"
                    />
                </div>

                <BayteWordmark className="mx-auto mt-4 w-24" />
            </article>

            <BayteProductSheet
                open={detailsOpen}
                onClose={() => setDetailsOpen(false)}
                slug={slug}
                name={name}
                description={description}
                src={src}
            />
        </>
    );
}
