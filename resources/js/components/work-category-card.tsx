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
                className="aspect-4/5 rounded-3xl @3xl:aspect-3/4"
                imgClassName="object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            >
                <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent"
                />

                <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 @lg:p-7">
                    <span className="min-w-0">
                        <span className="block font-display text-[clamp(1.35rem,3.4cqi,2.1rem)] leading-tight text-white">
                            {category.name}
                        </span>
                        <span className="mt-2 block text-sm tracking-[0.15em] text-cream uppercase">
                            {category.projectsCount}{' '}
                            {category.projectsCount === 1
                                ? 'project'
                                : 'projects'}
                        </span>
                    </span>

                    <span
                        aria-hidden="true"
                        className="grid size-11 shrink-0 place-items-center rounded-full bg-brand text-brand-foreground transition-transform duration-500 ease-out group-hover:rotate-45 motion-reduce:transition-none motion-reduce:group-hover:rotate-0"
                    >
                        <ArrowUpRight className="size-5" strokeWidth={1.75} />
                    </span>
                </span>
            </SmartImage>
        </Link>
    );
}
