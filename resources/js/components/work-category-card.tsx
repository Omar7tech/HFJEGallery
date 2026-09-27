import { Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { SmartImage } from '@/components/smart-image';
import type { WorkCategory } from '@/types';

interface WorkCategoryCardProps {
    category: WorkCategory;
    /** Position in the grid, from 0 — staggers the entrance across a row. */
    index: number;
    /** Above the fold: fetch the image with the page instead of lazily. */
    eager?: boolean;
}

/**
 * A category as a landscape photo card. At rest: the photo and the name on a
 * soft ink gradient. On hover the photo leans in, the gradient deepens and
 * the description rises under the name while the terracotta arrow turns
 * toward it.
 *
 * Cards fade up one after another as they scroll into view. Touch and
 * reduced-motion visitors get the calm resting card.
 */
export default function WorkCategoryCard({
    category,
    index,
    eager = false,
}: WorkCategoryCardProps) {
    const reducedMotion = useReducedMotion();

    return (
        <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 28 }}
            whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{
                duration: 0.7,
                delay: (index % 2) * 0.12,
                ease: [0.22, 1, 0.36, 1],
            }}
        >
            <Link
                href={`/work/${category.slug}`}
                prefetch
                className="group block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand md:rounded-3xl"
            >
                <SmartImage
                    src={category.image}
                    alt={category.name}
                    loading={eager ? 'eager' : 'lazy'}
                    fetchPriority={eager ? 'high' : undefined}
                    className="aspect-video rounded-2xl md:rounded-3xl lg:aspect-2/1"
                    imgClassName="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                >
                    {/* Resting gradient, and a deeper one that fades in on
                        hover to carry the description. */}
                    <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 bg-linear-to-t from-ink/70 via-ink/10 to-transparent"
                    />
                    <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 bg-linear-to-t from-ink/60 via-ink/25 to-transparent opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100 motion-reduce:transition-none"
                    />

                    <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 md:p-7">
                        <span className="min-w-0">
                            <span className="block font-display text-[clamp(1.25rem,5.5vw,1.75rem)] leading-tight wrap-break-word text-white sm:text-[clamp(1.1rem,2.6vw,2.25rem)]">
                                {category.name}
                            </span>

                            {/* Rises under the name on hover; the grid-rows
                                trick animates its height without measuring. */}
                            {category.description && (
                                <span className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-out group-hover:grid-rows-[1fr] motion-reduce:transition-none">
                                    <span className="overflow-hidden">
                                        <span className="block max-w-md translate-y-2 pt-2 font-sans text-sm leading-relaxed text-cream/90 opacity-0 transition-[opacity,translate] delay-100 duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100 motion-reduce:transition-none md:text-base">
                                            {category.description}
                                        </span>
                                    </span>
                                </span>
                            )}
                        </span>

                        <span
                            aria-hidden="true"
                            className="grid size-10 shrink-0 place-items-center rounded-full bg-brand text-brand-foreground transition-[rotate,background-color] duration-500 ease-out group-hover:rotate-45 group-hover:bg-brand-hover motion-reduce:transition-none motion-reduce:group-hover:rotate-0 md:size-12"
                        >
                            <ArrowUpRight
                                className="size-5"
                                strokeWidth={1.75}
                            />
                        </span>
                    </span>
                </SmartImage>
            </Link>
        </motion.div>
    );
}
