import { Head, router } from '@inertiajs/react';
import { Loader2, Search, SlidersHorizontal, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import BayteCatalogueCard from '@/components/bayte-catalogue-card';
import BayteWordmarkDraw from '@/components/bayte-wordmark-draw';
import BottomSheet from '@/components/bottom-sheet';
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
    /** The category shown, or null for the whole collection. */
    activeCategory: string | null;
    /** The search the pieces are narrowed by, or an empty string. */
    search: string;
    /** How many pieces match the category and search. */
    total: number;
    products: { data: Product[] };
}

/** Wait this long after the last keystroke before searching. */
const SEARCH_DELAY = 300;

/** The catalogue for a category and a search; both optional. */
function catalogueHref(category: string | null, search: string): string {
    const params = new URLSearchParams();

    if (category) {
        params.set('category', category);
    }

    if (search.trim()) {
        params.set('search', search.trim());
    }

    const query = params.toString();

    return query ? `/bayte?${query}` : '/bayte';
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
    search,
    total,
    products,
}: BaytePageProps) {
    const results = useRef<HTMLDivElement>(null);
    const [query, setQuery] = useState(search);
    const [seenSearch, setSeenSearch] = useState(search);
    const [searching, setSearching] = useState(false);
    const [sheetOpen, setSheetOpen] = useState(false);
    const latestSearch = useRef(0);

    // The URL's search changed without typing (back / forward): show it.
    if (search !== seenSearch) {
        setSeenSearch(search);

        if (search !== query.trim()) {
            setQuery(search);
        }
    }

    const filter = useFilterVisit({
        active: activeCategory,
        activeProp: 'activeCategory',
        // A category keeps the search typed so far.
        href: (category) => catalogueHref(category, query),
        only: ['products', 'activeCategory', 'total'],
        reset: ['products'],
        results,
    });

    // Search as the visitor types, once they pause. `replace` keeps each
    // keystroke out of the browser history; only the pieces reload.
    useEffect(() => {
        if (query.trim() === search) {
            return;
        }

        const visit = ++latestSearch.current;
        const timer = setTimeout(() => {
            setSearching(true);
            router.get(
                catalogueHref(filter.selected, query),
                {},
                {
                    only: ['products', 'search', 'total'],
                    reset: ['products'],
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                    showProgress: false,
                    onFinish: () => {
                        if (visit === latestSearch.current) {
                            setSearching(false);
                        }
                    },
                },
            );
        }, SEARCH_DELAY);

        return () => clearTimeout(timer);
        // Only a new query starts a search; the category is read as it is.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query]);

    const loading = filter.loading || searching;
    const selectedName =
        categories.find((category) => category.slug === filter.selected)
            ?.name ?? 'All pieces';

    const pick = (category: string | null) => {
        setSheetOpen(false);
        filter.select(category);
    };

    /** "All" and every category, as rows of a list. */
    const categoryList = (
        <ul className="flex flex-col gap-0.5">
            {[{ slug: null, name: 'All pieces' }, ...categories].map(
                (category) => (
                    <li key={category.slug ?? 'all'}>
                        <FilterPill
                            variant="list"
                            href={catalogueHref(category.slug, query)}
                            active={category.slug === filter.selected}
                            onSelect={() => pick(category.slug)}
                            onPrefetch={() => filter.prefetch(category.slug)}
                        >
                            {category.name}
                        </FilterPill>
                    </li>
                ),
            )}
        </ul>
    );

    return (
        <>
            <Head title={search ? `“${search}” · BAYTÉ` : 'BAYTÉ'}>
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

                <div className="mt-10 grid gap-8 @4xl:mt-14 @4xl:grid-cols-[13rem_minmax(0,1fr)] @4xl:gap-10 @6xl:grid-cols-[15rem_minmax(0,1fr)]">
                    {/* Categories down the side on a wide screen; a sheet
                        on a phone. */}
                    <aside className="hidden @4xl:block">
                        <nav
                            aria-label="Product categories"
                            className="sticky top-8"
                        >
                            <h2 className="px-3.5 pb-3 font-sans text-xs tracking-[0.15em] text-ink/50 uppercase">
                                Categories
                            </h2>
                            {categoryList}
                        </nav>
                    </aside>

                    <div className="@container/results min-w-0">
                        {/* Search, with the category button beside it on a
                            phone. */}
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <label
                                    htmlFor="bayte-search"
                                    className="sr-only"
                                >
                                    Search the collection
                                </label>
                                <Search
                                    aria-hidden="true"
                                    className="pointer-events-none absolute top-1/2 left-4 size-4.5 -translate-y-1/2 text-ink/40"
                                    strokeWidth={1.75}
                                />
                                <input
                                    id="bayte-search"
                                    type="search"
                                    value={query}
                                    onChange={(event) =>
                                        setQuery(event.target.value)
                                    }
                                    placeholder="Search pieces…"
                                    autoComplete="off"
                                    enterKeyHint="search"
                                    maxLength={100}
                                    className="h-12 w-full rounded-full border border-ink/15 bg-white pr-12 pl-11 font-sans text-base text-ink transition-colors placeholder:text-ink/45 hover:border-ink/30 focus:border-brand focus:outline-none focus-visible:ring-3 focus-visible:ring-brand/20 [&::-webkit-search-cancel-button]:hidden"
                                />
                                <span className="absolute top-1/2 right-2 grid size-9 -translate-y-1/2 place-items-center">
                                    {searching ? (
                                        <Loader2
                                            aria-hidden="true"
                                            className="size-4 animate-spin text-brand/70"
                                        />
                                    ) : (
                                        query && (
                                            <button
                                                type="button"
                                                onClick={() => setQuery('')}
                                                aria-label="Clear search"
                                                className="grid size-9 place-items-center rounded-full text-ink/50 transition-colors hover:bg-ink/5 hover:text-ink focus-visible:outline-2 focus-visible:outline-brand"
                                            >
                                                <X
                                                    className="size-4"
                                                    strokeWidth={2}
                                                />
                                            </button>
                                        )
                                    )}
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={() => setSheetOpen(true)}
                                className="inline-flex h-12 shrink-0 items-center gap-2 rounded-full border border-ink/15 px-4 font-sans text-sm text-ink transition-colors hover:border-ink/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand @4xl:hidden"
                            >
                                <SlidersHorizontal
                                    className="size-4"
                                    strokeWidth={1.75}
                                />
                                <span className="sr-only">Category: </span>
                                <span className="max-w-32 truncate">
                                    {filter.selected ? selectedName : 'Filter'}
                                </span>
                            </button>
                        </div>

                        {/* What is on screen: the category, how many pieces,
                            and the search with a way out of it. */}
                        <div
                            ref={results}
                            className="mt-6 flex scroll-mt-[calc(5rem+max(0.75rem,env(safe-area-inset-top)))] flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-ink/10 pb-4 lg:scroll-mt-8"
                        >
                            <h2 className="font-display text-[clamp(1.1rem,2.6cqi,1.6rem)] leading-tight text-ink">
                                {selectedName}
                            </h2>
                            <p
                                aria-live="polite"
                                className={cn(
                                    'font-sans text-sm text-ink/55 transition-opacity duration-200 motion-reduce:transition-none',
                                    loading && 'opacity-0',
                                )}
                            >
                                {total} {total === 1 ? 'piece' : 'pieces'}
                                {search && (
                                    <>
                                        {' '}
                                        for{' '}
                                        <span className="text-ink">
                                            “{search}”
                                        </span>
                                    </>
                                )}
                            </p>
                        </div>

                        {products.data.length > 0 ? (
                            <LoadMoreGrid
                                data="products"
                                count={products.data.length}
                                className="grid gap-4 @lg/results:grid-cols-2 @lg/results:gap-5 @4xl/results:grid-cols-3"
                                skeleton={skeleton}
                                loading={loading}
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
                        ) : search ? (
                            <div className="mt-6 rounded-2xl bg-surface px-6 py-16 text-center font-sans">
                                <p className="text-base text-ink">
                                    No pieces match “{search}”
                                    {filter.selected && ` in ${selectedName}`}.
                                </p>
                                <p className="mt-2 text-sm text-ink/60">
                                    Try another word, or look through the whole
                                    collection.
                                </p>
                                <div className="mt-6 flex flex-wrap justify-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setQuery('')}
                                        className="inline-flex min-h-11 items-center rounded-full bg-brand px-6 text-sm text-brand-foreground transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                                    >
                                        Clear search
                                    </button>
                                    {filter.selected && (
                                        <button
                                            type="button"
                                            onClick={() => pick(null)}
                                            className="inline-flex min-h-11 items-center rounded-full border border-ink/15 px-6 text-sm text-ink transition-colors hover:border-ink/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                                        >
                                            Search all pieces
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <p className="mt-6 rounded-2xl bg-surface px-6 py-16 text-center font-display text-base text-ink/60">
                                The collection is being photographed. Check back
                                soon.
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <BottomSheet
                open={sheetOpen}
                onClose={() => setSheetOpen(false)}
                title="Categories"
            >
                {categoryList}
            </BottomSheet>
        </>
    );
}
