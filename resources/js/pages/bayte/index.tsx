import { Head } from '@inertiajs/react';
import BayteCatalogueCard from '@/components/bayte-catalogue-card';
import BayteWordmarkDraw from '@/components/bayte-wordmark-draw';
import FilterPill from '@/components/filter-pill';
import LoadMoreGrid from '@/components/load-more-grid';
import { useFilterVisit } from '@/lib/use-filter-visit';
import { cn } from '@/lib/utils';

interface Category {
    slug: string;
    name: string;
}

interface Product {
    slug: string;
    name: string;
    description: string;
    image: string;
}

interface BaytePageProps {
    categories: Category[];
    activeCategory: string | null;
    /** How many pieces the active category holds. */
    total: number;
    products: { data: Product[] };
}

/** One shelf of the collection; no category opens the first. */
function categoryHref(category: string | null): string {
    return category
        ? `/bayte?category=${encodeURIComponent(category)}`
        : '/bayte';
}

/** The outline of a catalogue card: its name, description and cutout. */
const skeleton = (
    <div className="relative overflow-hidden rounded-2xl bg-surface p-5">
        <span className="absolute inset-0 animate-shimmer bg-linear-to-r from-transparent via-white/50 to-transparent motion-reduce:hidden" />
        <div className="h-6 w-1/2 rounded-full bg-ink/8" />
        <div className="mt-3 h-3 w-4/5 rounded-full bg-ink/6" />
        <div className="mt-4 aspect-3/2 w-full" />
    </div>
);

export default function BayteIndex({
    categories,
    activeCategory,
    total,
    products,
}: BaytePageProps) {
    const filter = useFilterVisit({
        active: activeCategory,
        href: categoryHref,
        only: ['products', 'activeCategory', 'total'],
        reset: ['products'],
    });

    const selectedName = categories.find(
        (category) => category.slug === filter.selected,
    )?.name;

    return (
        <>
            <Head title="BAYTÉ">
                <meta
                    name="description"
                    content="BAYTÉ by HFJE: furniture designed for modern Lebanese homes."
                />
            </Head>

            <div className="@container px-5 pt-6 pb-20 md:px-8 md:pb-24 lg:pr-7 lg:pl-0">
                <h1 className="sr-only">BAYTÉ by HFJE</h1>

                {/* Wordmark, with the "BY HFJE" endorsement tucked under its
                    right edge, the same lockup as the home section. */}
                <div className="w-full max-w-3xl @3xl:w-[78%]">
                    <BayteWordmarkDraw className="block w-full" />
                    <p className="mt-3 text-right font-display text-xs tracking-[0.08em] text-ink uppercase @lg:text-sm">
                        By HFJE
                    </p>
                </div>

                {/* Full-bleed on small screens so the row can scroll past the
                    page gutter instead of stopping short of it. */}
                <nav
                    aria-label="Product categories"
                    className="nav-scroll mt-10 -mr-5 -ml-5 flex snap-x snap-mandatory gap-2 overflow-x-auto px-5 pb-2 md:-mr-8 md:-ml-8 md:px-8 lg:-mr-7 lg:ml-0 lg:pr-7 lg:pl-0 @3xl:mx-0 @3xl:flex-wrap @3xl:overflow-visible @3xl:px-0"
                >
                    {categories.map((category) => (
                        <FilterPill
                            key={category.slug}
                            href={categoryHref(category.slug)}
                            active={category.slug === filter.selected}
                            onSelect={() => filter.select(category.slug)}
                            onPrefetch={() => filter.prefetch(category.slug)}
                            className="snap-start"
                        >
                            {category.name}
                        </FilterPill>
                    ))}
                </nav>

                <div className="mt-8 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-ink/10 pb-4">
                    <h2 className="font-display text-[clamp(1.1rem,2.6cqi,1.75rem)] leading-tight text-ink">
                        {selectedName ?? 'The Collection'}
                    </h2>
                    {/* The count belongs to the shelf on screen, so it fades
                        while the next one loads. */}
                    <p
                        className={cn(
                            'text-sm text-ink/50 transition-opacity duration-200 motion-reduce:transition-none',
                            filter.loading && 'opacity-0',
                        )}
                    >
                        {total} {total === 1 ? 'piece' : 'pieces'}
                    </p>
                </div>

                {products.data.length > 0 ? (
                    <LoadMoreGrid
                        data="products"
                        count={products.data.length}
                        className="grid gap-4 @xl:grid-cols-2 @2xl:gap-5 @3xl:grid-cols-3"
                        skeleton={skeleton}
                        loading={filter.loading}
                    >
                        {products.data.map((product) => (
                            <BayteCatalogueCard
                                key={product.slug}
                                name={product.name}
                                description={product.description}
                                src={product.image}
                            />
                        ))}
                    </LoadMoreGrid>
                ) : (
                    <p className="mt-6 rounded-2xl bg-surface px-6 py-16 text-center font-display text-base text-ink/60">
                        The collection is being photographed. Check back soon.
                    </p>
                )}
            </div>
        </>
    );
}
