import { Head, router } from '@inertiajs/react';
import {
    Check,
    ChevronDown,
    Loader2,
    Search,
    SlidersHorizontal,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import BayteCatalogueCard from '@/components/bayte-catalogue-card';
import BayteSelection from '@/components/bayte-selection';
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
    /** Where a selection of pieces is sent, or null when it can't be sent yet. */
    whatsappNumber: string | null;
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
    <div className="relative flex flex-col overflow-hidden rounded-2xl bg-surface p-5 max-md:p-2">
        <span className="absolute inset-0 animate-shimmer bg-linear-to-r from-transparent via-white/50 to-transparent motion-reduce:hidden" />
        <div className="h-6 w-1/2 rounded-full bg-ink/8 max-md:order-2 max-md:mt-2.5 max-md:h-4" />
        <div className="mt-3 h-3 w-4/5 rounded-full bg-ink/6 max-md:order-3 max-md:mt-2 max-md:mb-1" />
        <div className="mt-4 aspect-3/2 w-full max-md:order-1 max-md:mt-0 max-md:aspect-square max-md:rounded-xl max-md:bg-white/60" />
    </div>
);

export default function BayteIndex({
    categories,
    activeCategory,
    whatsappNumber,
    search,
    total,
    products,
}: BaytePageProps) {
    const results = useRef<HTMLDivElement>(null);
    const [query, setQuery] = useState(search);
    const [seenSearch, setSeenSearch] = useState(search);
    const [searching, setSearching] = useState(false);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const menu = useRef<HTMLDivElement>(null);
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

    /** The dropdown from a tablet up, the bottom sheet on a phone. */
    const openCategories = () => {
        if (window.matchMedia('(min-width: 768px)').matches) {
            setMenuOpen((open) => !open);
        } else {
            setSheetOpen(true);
        }
    };

    // The dropdown closes on a click outside it or on Escape.
    useEffect(() => {
        if (!menuOpen) {
            return;
        }

        const onPointerDown = (event: PointerEvent) => {
            if (!menu.current?.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setMenuOpen(false);
            }
        };
        document.addEventListener('pointerdown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);

        return () => {
            document.removeEventListener('pointerdown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [menuOpen]);

    const pick = (category: string | null) => {
        setSheetOpen(false);
        setMenuOpen(false);
        filter.select(category);
    };

    /** "All" and every category, as rows of a list. */
    /** "All" across the top, then the categories two by two. */
    const categoryList = (
        <ul className="grid grid-cols-2 gap-1">
            {[{ slug: null, name: 'All pieces' }, ...categories].map(
                (category) => {
                    const active = category.slug === filter.selected;

                    return (
                        <li
                            key={category.slug ?? 'all'}
                            className={cn(
                                'min-w-0',
                                category.slug === null && 'col-span-2',
                            )}
                        >
                            <FilterPill
                                variant="list"
                                href={catalogueHref(category.slug, query)}
                                active={active}
                                onSelect={() => pick(category.slug)}
                                onPrefetch={() =>
                                    filter.prefetch(category.slug)
                                }
                            >
                                <span className="truncate">
                                    {category.name}
                                </span>
                                {active && (
                                    <Check
                                        aria-hidden="true"
                                        className="size-4 shrink-0"
                                        strokeWidth={2.25}
                                    />
                                )}
                            </FilterPill>
                        </li>
                    );
                },
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

            <div className="@container px-5 pt-6 pb-20 max-md:pt-4 max-md:pb-12 md:px-8 md:pb-24 lg:pr-7 lg:pl-0">
                <h1 className="sr-only">BAYTÉ by HFJE</h1>

                {/* Wordmark, with the "BY HFJE" endorsement tucked under its
                    right edge, the same lockup as the home section. */}
                <div className="w-full max-w-3xl @3xl:w-[78%]">
                    <BayteWordmarkDraw className="block w-full" />
                    <p className="mt-3 text-right font-display text-xs tracking-[0.08em] text-ink uppercase @lg:text-sm">
                        By HFJE
                    </p>
                </div>

                <div className="@container/results mt-10 min-w-0 max-md:mt-7 @4xl:mt-14">
                    {/* Search, with the category dropdown beside it. */}
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <label htmlFor="bayte-search" className="sr-only">
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

                        {/* Categories in a compact dropdown beside the
                                search: a menu under the button from a
                                tablet up, a sheet from the bottom on a
                                phone. The grid keeps the full width. */}
                        <div ref={menu} className="relative shrink-0">
                            <button
                                type="button"
                                onClick={openCategories}
                                aria-haspopup="true"
                                aria-expanded={menuOpen || sheetOpen}
                                className={cn(
                                    'inline-flex h-12 items-center gap-2 rounded-full border px-4 font-sans text-sm text-ink transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand @lg/results:px-5',
                                    menuOpen
                                        ? 'border-ink/40'
                                        : 'border-ink/15 hover:border-ink/40',
                                )}
                            >
                                <SlidersHorizontal
                                    className="size-4 @lg/results:hidden"
                                    strokeWidth={1.75}
                                />
                                <span className="sr-only">Category: </span>
                                <span className="max-w-32 truncate @lg/results:max-w-48">
                                    {selectedName}
                                </span>
                                <ChevronDown
                                    aria-hidden="true"
                                    className={cn(
                                        'hidden size-4 text-ink/50 transition-transform duration-200 motion-reduce:transition-none @lg/results:block',
                                        menuOpen && 'rotate-180',
                                    )}
                                    strokeWidth={1.75}
                                />
                            </button>

                            {menuOpen && (
                                <nav
                                    aria-label="Product categories"
                                    // Two columns fit every category without
                                    // a scrollbar; it eases in from the button.
                                    className="absolute top-full right-0 z-30 mt-3 w-[min(30rem,calc(100vw-4rem))] origin-top-right rounded-3xl bg-white/95 p-3 shadow-[0_24px_60px_-24px_rgb(74_48_32/0.4)] ring-1 ring-ink/8 backdrop-blur-xl transition-[opacity,scale,translate] duration-200 ease-out motion-reduce:transition-none starting:-translate-y-1 starting:scale-95 starting:opacity-0"
                                >
                                    <p className="px-3.5 pt-1 pb-2.5 font-sans text-xs tracking-[0.15em] text-ink/45 uppercase">
                                        Browse by category
                                    </p>
                                    {categoryList}
                                </nav>
                            )}
                        </div>
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
                                    <span className="text-ink">“{search}”</span>
                                </>
                            )}
                        </p>
                    </div>

                    {products.data.length > 0 ? (
                        <LoadMoreGrid
                            data="products"
                            count={products.data.length}
                            className="grid gap-4 max-md:grid-cols-2 max-md:gap-x-2.5 max-md:gap-y-3 @lg/results:grid-cols-2 @lg/results:gap-5 @4xl/results:grid-cols-3"
                            skeleton={skeleton}
                            loading={loading}
                        >
                            {products.data.map((product) => (
                                <BayteCatalogueCard
                                    key={product.slug}
                                    slug={product.slug}
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

            <BottomSheet
                open={sheetOpen}
                onClose={() => setSheetOpen(false)}
                title="Categories"
            >
                {categoryList}
            </BottomSheet>

            <BayteSelection whatsappNumber={whatsappNumber} />
        </>
    );
}
