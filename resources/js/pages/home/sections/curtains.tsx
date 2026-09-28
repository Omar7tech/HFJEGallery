import { Link } from '@inertiajs/react';
import { SmartImage } from '@/components/smart-image';
import { cn } from '@/lib/utils';

interface Shot {
    src: string;
    alt: string;
    /** Column span in the 7-column desktop grid, plus its stacked aspect. */
    className: string;
}

const gallery: Shot[] = [
    {
        src: '/images/women-opening-curtain.webp',
        alt: 'Woman drawing a floor-length curtain open to let daylight into a room',
        className: 'aspect-4/5 @2xl:col-span-3',
    },
    {
        src: '/images/curtain.webp',
        alt: 'Curtain fabrics in linen, suede and sheer weaves hung side by side',
        className: 'aspect-3/2 max-md:aspect-4/5 @2xl:col-span-4',
    },
];

interface Action {
    label: string;
    /** Where it leads; a plain button until its page exists. */
    href?: string;
    /** Solid terracotta instead of soft cream, one per row. */
    filled?: boolean;
}

const actions: Action[] = [
    { label: 'Curtain Styles', href: '/curtains/styles' },
    { label: 'Projects', href: '/curtains/work', filled: true },
    { label: 'Fabric Library' },
];

function Curtains() {
    return (
        <section className="@container w-full px-5 py-16 font-display max-md:py-10 md:px-12 md:py-24 lg:flex lg:h-dvh lg:max-h-[1000px] lg:min-h-[640px] lg:flex-col lg:py-10 lg:pr-16 lg:pl-0">
            <h2 className="max-w-4xl font-display text-[clamp(2rem,8cqi,3.5rem)] leading-[1.05] text-ink">
                Curtains &amp; Textiles
            </h2>

            <p className="mt-6 text-lg leading-[1.4] text-ink max-md:mt-4 lg:mt-4 @lg:text-2xl">
                The finishing layer of every room.
            </p>

            <p className="mt-4 max-w-2xl font-sans text-base leading-relaxed text-brand max-md:mt-3 max-md:text-[15px]">
                From fabric selection and precise measurements to tailoring and
                installation, HFJE creates custom curtain solutions designed
                around the light, proportions, and character of each space.
            </p>

            {/* Narrow portrait beside a wider fabric study — 3 / 4 of a 7-col grid. */}
            <div className="mt-8 grid gap-3 max-md:mt-6 max-md:grid-cols-2 max-md:gap-2 lg:mt-6 lg:min-h-0 lg:flex-[1_1_0] lg:grid-rows-[minmax(0,1fr)] @2xl:h-110 @2xl:grid-cols-7 @2xl:gap-5">
                {gallery.map((shot) => (
                    <SmartImage
                        key={shot.src}
                        src={shot.src}
                        alt={shot.alt}
                        className={cn(
                            'group min-w-0 rounded-2xl lg:aspect-auto lg:h-full @2xl:aspect-auto @2xl:h-full @2xl:rounded-3xl',
                            shot.className,
                        )}
                        imgClassName="object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none"
                    />
                ))}
            </div>

            {/* The terracotta button sits proud of the row and is sized to its label,
          while the others share the remaining width. */}
            <div className="mt-3 flex flex-col gap-3 max-md:mt-2 max-md:grid max-md:grid-flow-dense max-md:grid-cols-2 max-md:gap-2 @lg:flex-row @lg:items-stretch @lg:gap-4">
                {actions.map((action) => {
                    const className = cn(
                        'rounded-2xl text-center tracking-[0.02em] transition-colors duration-300 ease-out focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand motion-reduce:transition-none max-md:rounded-xl max-md:py-3.5 max-md:text-sm @lg:rounded-3xl @lg:text-lg',
                        action.filled
                            ? 'bg-brand py-6 text-brand-foreground hover:bg-brand-hover max-md:col-span-2 @lg:-my-1 @lg:shrink-0 @lg:px-14'
                            : 'bg-cream/40 py-5 text-brand hover:bg-cream/70 @lg:flex-1',
                    );

                    return action.href ? (
                        <Link
                            key={action.label}
                            href={action.href}
                            prefetch
                            className={className}
                        >
                            {action.label}
                        </Link>
                    ) : (
                        <button
                            key={action.label}
                            type="button"
                            className={className}
                        >
                            {action.label}
                        </button>
                    );
                })}
            </div>
        </section>
    );
}

export default Curtains;
