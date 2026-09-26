import { Plus } from 'lucide-react';
import BayteWordmark from '@/components/bayte-wordmark';
import { SmartImage } from '@/components/smart-image';

interface BayteCatalogueCardProps {
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
 * a small lift and the product drawing closer.
 */
export default function BayteCatalogueCard({
    name,
    description,
    src,
}: BayteCatalogueCardProps) {
    return (
        <article className="group flex flex-col rounded-2xl bg-[#f2f1ef] p-5 transition-[background-color,box-shadow,transform] duration-500 ease-out hover:-translate-y-1 hover:bg-[#f5f4f1] hover:shadow-[0_26px_50px_-34px_rgba(74,48,32,0.6)] motion-reduce:transition-none motion-reduce:hover:translate-y-0">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <h3 className="text-xl leading-tight text-ink">{name}</h3>
                    <p className="mt-2 text-xs leading-[1.5] text-ink/70">
                        {description}
                    </p>
                </div>

                <span
                    aria-hidden="true"
                    className="grid size-7 shrink-0 place-items-center rounded-full bg-brand text-brand-foreground transition-transform duration-500 ease-out group-hover:rotate-90 motion-reduce:transition-none motion-reduce:group-hover:rotate-0"
                >
                    <Plus className="size-4" strokeWidth={2.5} />
                </span>
            </div>

            <div className="relative mt-4 aspect-3/2 w-full">
                {/* Ground shadow, fading in with the lift so the cutout reads
                    as standing on the card rather than printed on it. */}
                <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-10 bottom-1 h-4 rounded-[50%] bg-ink/25 opacity-0 blur-lg transition-opacity duration-500 ease-out group-hover:opacity-100 motion-reduce:hidden"
                />

                <SmartImage
                    src={src}
                    alt={name}
                    className="absolute inset-0 scale-[0.84] transition-transform duration-500 ease-out group-hover:scale-[0.93] motion-reduce:transition-none motion-reduce:group-hover:scale-[0.84]"
                    imgClassName="object-contain"
                    placeholderClassName="bg-transparent"
                    loading="lazy"
                />
            </div>

            <BayteWordmark className="mx-auto mt-4 w-24" />
        </article>
    );
}
