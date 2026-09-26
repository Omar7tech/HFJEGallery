import { Head, Link, progress, router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import BayteCatalogueCard from '@/components/bayte-catalogue-card';
import BayteWordmarkDraw from '@/components/bayte-wordmark-draw';
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
    products: {
        data: Product[];
        currentPage: number;
        lastPage: number;
        total: number;
    };
}

/** The props the controller recomputes on every filter or page change. */
const PARTIAL_PROPS = ['products', 'activeCategory'];

/**
 * Shared by every in-page link: a partial reload that keeps the top progress
 * bar away, since the grid reports the wait itself.
 *
 * `async` is what carries that — Inertia turns an async visit into
 * `showProgress: false`, and `<Link>` has no `showProgress` prop of its own.
 */
const VISIT_OPTIONS = {
    only: PARTIAL_PROPS,
    preserveScroll: true,
    preserveState: true,
    async: true,
    prefetch: true,
} as const;

/** Long enough that a quick response never flashes the dimmed grid. */
const PENDING_DELAY = 180;

function buildUrl(category: string | null, page = 1): string {
    const params = new URLSearchParams();

    if (category) {
        params.set('category', category);
    }

    if (page > 1) {
        params.set('page', String(page));
    }

    const query = params.toString();

    return query ? `/bayte?${query}` : '/bayte';
}

export default function BayteIndex({
    categories,
    activeCategory,
    products,
}: BaytePageProps) {
    const { data, currentPage, lastPage, total } = products;

    const [pending, setPending] = useState(false);
    // The pill the visitor just tapped, shown as active before the response
    // lands so the filter never feels like it ignored the tap.
    const [tapped, setTapped] = useState<string | null>(null);
    const heading = useRef<HTMLDivElement>(null);

    const selected = tapped ?? activeCategory;
    const selectedName = categories.find(
        (category) => category.slug === selected,
    )?.name;

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout> | undefined;

        const stopStart = router.on('start', (event) => {
            if (event.detail.visit.url?.pathname === '/bayte') {
                timer = setTimeout(() => setPending(true), PENDING_DELAY);
            }
        });

        const stopFinish = router.on('finish', () => {
            clearTimeout(timer);
            setPending(false);
            setTapped(null);

            // Inertia hides the bar for a no-progress visit and never puts it
            // back, so clear it out and reset the flag — the rest of the site
            // keeps its progress bar.
            progress.remove();
            progress.reveal(true);
        });

        return () => {
            clearTimeout(timer);
            stopStart();
            stopFinish();
        };
    }, []);

    /**
     * Bring the results back into view when they have scrolled off the top —
     * paging from the foot of a long grid otherwise leaves you at the bottom.
     */
    const keepResultsInView = useCallback(() => {
        // Measure after the new grid has been painted: a shorter page can
        // change where the heading sits.
        requestAnimationFrame(() => {
            const top = heading.current?.getBoundingClientRect().top ?? 0;

            if (top >= 0) {
                return;
            }

            heading.current?.scrollIntoView({
                behavior: window.matchMedia('(prefers-reduced-motion: reduce)')
                    .matches
                    ? 'auto'
                    : 'smooth',
                block: 'start',
            });
        });
    }, []);

    return (
        <>
            <Head title="BAYTÉ">
                <meta
                    name="description"
                    content="BAYTÉ by HFJE — furniture designed for modern Lebanese homes."
                />
            </Head>

            <div className="@container px-5 pt-6 pb-20 md:px-8 md:pb-24 lg:pr-7 lg:pl-0">
                <h1 className="sr-only">BAYTÉ by HFJE</h1>

                {/* Wordmark, with the "BY HFJE" endorsement tucked under its
                    right edge — the same lockup as the home section. */}
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
                    {categories.map((category) => {
                        const active = category.slug === selected;

                        return (
                            <Link
                                key={category.slug}
                                href={buildUrl(category.slug)}
                                {...VISIT_OPTIONS}
                                onClick={() => setTapped(category.slug)}
                                onSuccess={keepResultsInView}
                                aria-current={active ? 'true' : undefined}
                                className={cn(
                                    'inline-flex h-10 shrink-0 snap-start items-center rounded-full border px-4 text-sm whitespace-nowrap transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand motion-reduce:transition-none',
                                    active
                                        ? 'border-brand bg-brand text-brand-foreground'
                                        : 'border-ink/15 text-ink/70 hover:border-ink/40 hover:text-ink',
                                )}
                            >
                                {category.name}
                            </Link>
                        );
                    })}
                </nav>

                <div
                    ref={heading}
                    className="mt-8 flex scroll-mt-24 flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-ink/10 pb-4 lg:scroll-mt-8"
                >
                    <h2 className="font-display text-[clamp(1.1rem,2.6cqi,1.75rem)] leading-tight text-ink">
                        {selectedName ?? 'The Collection'}
                    </h2>
                    <p className="text-sm text-ink/50">
                        {total} {total === 1 ? 'piece' : 'pieces'}
                        {lastPage > 1 &&
                            ` · page ${currentPage} of ${lastPage}`}
                    </p>
                </div>

                {data.length > 0 ? (
                    <div
                        aria-busy={pending}
                        className={cn(
                            'mt-6 grid gap-4 transition-opacity duration-200 ease-out @xl:grid-cols-2 @2xl:gap-5 @3xl:grid-cols-3',
                            pending && 'pointer-events-none opacity-40',
                        )}
                    >
                        {data.map((product) => (
                            <BayteCatalogueCard
                                key={product.slug}
                                name={product.name}
                                description={product.description}
                                src={product.image}
                            />
                        ))}
                    </div>
                ) : (
                    <p className="mt-6 rounded-2xl bg-[#f2f1ef] px-6 py-16 text-center font-display text-base text-ink/60">
                        The collection is being photographed. Check back soon.
                    </p>
                )}

                {lastPage > 1 && (
                    <nav
                        aria-label="Pages"
                        className="mt-10 flex items-center justify-center gap-3"
                    >
                        <PageLink
                            category={activeCategory}
                            page={currentPage - 1}
                            disabled={currentPage === 1}
                            label="Previous page"
                            onNavigate={keepResultsInView}
                        >
                            <ChevronLeft
                                className="size-4"
                                strokeWidth={1.75}
                            />
                        </PageLink>

                        <p className="min-w-20 text-center text-sm text-ink/50">
                            {currentPage} / {lastPage}
                        </p>

                        <PageLink
                            category={activeCategory}
                            page={currentPage + 1}
                            disabled={currentPage === lastPage}
                            label="Next page"
                            onNavigate={keepResultsInView}
                        >
                            <ChevronRight
                                className="size-4"
                                strokeWidth={1.75}
                            />
                        </PageLink>
                    </nav>
                )}
            </div>
        </>
    );
}

interface PageLinkProps {
    category: string | null;
    page: number;
    label: string;
    disabled: boolean;
    onNavigate: () => void;
    children: ReactNode;
}

function PageLink({
    category,
    page,
    label,
    disabled,
    onNavigate,
    children,
}: PageLinkProps) {
    const shared =
        'inline-flex size-10 items-center justify-center rounded-full border transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand motion-reduce:transition-none';

    if (disabled) {
        return (
            <span
                aria-hidden="true"
                className={cn(shared, 'border-ink/10 text-ink/25')}
            >
                {children}
            </span>
        );
    }

    return (
        <Link
            href={buildUrl(category, page)}
            {...VISIT_OPTIONS}
            onSuccess={onNavigate}
            aria-label={label}
            className={cn(
                shared,
                'border-ink/15 text-ink/70 hover:border-ink/40 hover:text-ink',
            )}
        >
            {children}
        </Link>
    );
}
