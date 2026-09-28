import { Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { SmartImage } from '@/components/smart-image';
import { cn } from '@/lib/utils';

interface Discipline {
    title: string;
    body: string;
    href: string;
    image: string;
    /** Grid placement in the three-column bento. */
    className: string;
    /** A cutout sits whole on a light panel instead of filling the tile. */
    cutout?: boolean;
}

const disciplines: Discipline[] = [
    {
        title: 'Interiors',
        body: 'Homes, apartments, restaurants and commercial spaces.',
        href: '/work',
        image: '/images/modern-living-room-interior-design (1)-w1600.webp',
        className: '@3xl:col-span-2',
    },
    {
        title: 'Curtains & Textiles',
        body: 'Measured, tailored and installed for each window.',
        href: '/curtains',
        image: '/images/curtains/curtain-hero.webp',
        className: '',
    },
    {
        title: 'BAYTÉ',
        body: 'Ready-to-purchase furniture for modern Lebanese homes.',
        href: '/bayte',
        image: '/images/bayte/caramel-long-chair-nobg.webp',
        className: '',
        cutout: true,
    },
    {
        title: 'The Living Edit',
        body: 'Put a room together before anything is ordered.',
        href: '/living-edit',
        image: '/images/beige-sofa-contemporary-living-room-minimalist-interior-neutral-colors.webp',
        className: '@3xl:col-span-2',
    },
];

/** What the studio does: four tiles, each a way into its part of the site. */
function Disciplines() {
    const reducedMotion = useReducedMotion();

    return (
        <section className="@container w-full px-6 py-12 font-display md:px-12 md:py-16 lg:pr-16 lg:pl-0">
            <h2 className="max-w-xl text-[clamp(1.5rem,4cqi,2.25rem)] leading-[1.15] text-ink">
                One studio, every layer of a room.
            </h2>

            <ul className="mt-8 grid gap-3 @xl:grid-cols-2 @3xl:grid-cols-3 @3xl:gap-4">
                {disciplines.map((discipline, index) => (
                    <motion.li
                        key={discipline.title}
                        initial={reducedMotion ? false : { opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{
                            duration: 0.6,
                            delay: index * 0.06,
                            ease: [0.16, 1, 0.3, 1],
                        }}
                        className={discipline.className}
                    >
                        <Link
                            href={discipline.href}
                            prefetch
                            className={cn(
                                'group relative isolate flex h-56 flex-col justify-end overflow-hidden rounded-2xl p-5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand @3xl:h-64',
                                discipline.cutout ? 'bg-surface' : 'bg-cream',
                            )}
                        >
                            <SmartImage
                                src={discipline.image}
                                alt=""
                                className={cn(
                                    'absolute -z-10',
                                    discipline.cutout
                                        ? 'inset-x-0 top-0 bottom-20'
                                        : 'inset-0',
                                )}
                                imgClassName={cn(
                                    'transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105 motion-reduce:transition-none',
                                    discipline.cutout
                                        ? 'object-contain p-4'
                                        : 'object-cover',
                                )}
                                placeholderClassName={
                                    discipline.cutout
                                        ? 'bg-surface'
                                        : 'bg-cream'
                                }
                            />
                            {!discipline.cutout && (
                                <span
                                    aria-hidden="true"
                                    className="absolute inset-0 -z-10 bg-linear-to-t from-ink/75 via-ink/20 to-transparent"
                                />
                            )}

                            <div className="flex items-end justify-between gap-4">
                                <div
                                    className={
                                        discipline.cutout
                                            ? 'text-ink'
                                            : 'text-white'
                                    }
                                >
                                    <h3 className="text-lg leading-tight">
                                        {discipline.title}
                                    </h3>
                                    <p
                                        className={cn(
                                            'mt-1.5 font-sans text-sm leading-snug',
                                            discipline.cutout
                                                ? 'text-ink/65'
                                                : 'text-white/80',
                                        )}
                                    >
                                        {discipline.body}
                                    </p>
                                </div>
                                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-ink transition-colors duration-300 group-hover:bg-brand group-hover:text-brand-foreground">
                                    <ArrowUpRight
                                        className="size-4.5"
                                        strokeWidth={1.75}
                                    />
                                </span>
                            </div>
                        </Link>
                    </motion.li>
                ))}
            </ul>
        </section>
    );
}

export default Disciplines;
