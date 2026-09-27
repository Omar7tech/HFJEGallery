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
 * A category as a landscape photo card: the name sits on a soft
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
                className="aspect-video rounded-2xl md:rounded-3xl lg:aspect-2/1"
                imgClassName="object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            >
                <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-linear-to-t from-ink/70 via-ink/10 to-transparent"
                />

                <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 @lg:p-7">
                    <span className="min-w-0 font-display text-[clamp(1.25rem,5.5vw,1.75rem)] leading-tight wrap-break-word text-white sm:text-[clamp(1.1rem,2.6vw,2.25rem)]">
                        {category.name}
                    </span>

                    <span
                        aria-hidden="true"
                        className="grid size-10 shrink-0 place-items-center rounded-full bg-brand text-brand-foreground transition-transform duration-500 ease-out group-hover:rotate-45 motion-reduce:transition-none motion-reduce:group-hover:rotate-0 md:size-12"
                    >
                        <ArrowUpRight className="size-5" strokeWidth={1.75} />
                    </span>
                </span>
            </SmartImage>
        </Link>
    );
}
