import { Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';
import { SmartImage } from '@/components/smart-image';
import type { WorkCategory } from '@/types';

interface WorkCategoryCardProps {
    category: WorkCategory;
    /** Above the fold: fetch the image with the page instead of lazily. */
    eager?: boolean;
}

/**
 * A category as a tall photo card: the name and project count sit on a soft
 * ink gradient at the foot, and a terracotta arrow slides out on hover — the
 * same restrained language as the site's buttons.
 */
export default function WorkCategoryCard({
    category,
    eager = false,
}: WorkCategoryCardProps) {
    return (
        <Link
            href={`/work/${category.slug}`}
            prefetch
            className="group block rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
        >
            <SmartImage
                src={category.image}
                alt={category.name}
                loading={eager ? 'eager' : 'lazy'}
                fetchPriority={eager ? 'high' : undefined}
                className="aspect-3/4 rounded-2xl md:rounded-3xl"
                imgClassName="object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            >
                <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-linear-to-t from-ink/70 via-ink/10 to-transparent"
                />

                {/* Cards are two across on mobile and four on desktop, so the
                    name stays small enough to keep "Restaurants" on one
                    line at either width. */}
                <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3 md:gap-3 md:p-4 xl:p-5">
                    <span className="min-w-0 font-display text-[clamp(0.8rem,3.4vw,1.25rem)] leading-tight wrap-break-word text-white lg:text-[clamp(0.9rem,1.35vw,1.3rem)]">
                        {category.name}
                    </span>

                    <span
                        aria-hidden="true"
                        className="grid size-8 shrink-0 place-items-center rounded-full bg-brand text-brand-foreground transition-transform duration-500 ease-out group-hover:rotate-45 motion-reduce:transition-none motion-reduce:group-hover:rotate-0 md:size-10"
                    >
                        <ArrowUpRight
                            className="size-4 md:size-5"
                            strokeWidth={1.75}
                        />
                    </span>
                </span>
            </SmartImage>
        </Link>
    );
}
