import { Head, Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
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
    const { data, currentPage, lastPage } = products;

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
                        const active = category.slug === activeCategory;

                        return (
                            <Link
                                key={category.slug}
                                href={buildUrl(category.slug)}
                                only={PARTIAL_PROPS}
                                preserveScroll
                                preserveState
                                prefetch
                                aria-current={active ? 'true' : undefined}
                                className={cn(
                                    'inline-flex min-h-11 shrink-0 snap-start items-center rounded-full border px-5 font-display text-xs tracking-[0.1em] uppercase transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand motion-reduce:transition-none @lg:text-sm',
                                    active
                                        ? 'border-brand bg-brand text-brand-foreground'
                                        : 'border-ink/15 text-ink hover:border-brand hover:text-brand',
                                )}
                            >
                                {category.name}
                            </Link>
                        );
                    })}
                </nav>

                {data.length > 0 ? (
                    <div className="mt-6 grid gap-4 @xl:grid-cols-2 @2xl:gap-5 @3xl:grid-cols-3">
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
                        No pieces in this category yet.
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
                        >
                            <ChevronLeft
                                className="size-4"
                                strokeWidth={1.75}
                            />
                        </PageLink>

                        <p className="min-w-24 text-center font-display text-xs tracking-[0.1em] text-ink/60 uppercase">
                            {currentPage} / {lastPage}
                        </p>

                        <PageLink
                            category={activeCategory}
                            page={currentPage + 1}
                            disabled={currentPage === lastPage}
                            label="Next page"
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
    children: ReactNode;
}

function PageLink({
    category,
    page,
    label,
    disabled,
    children,
}: PageLinkProps) {
    const shared =
        'inline-flex size-11 items-center justify-center rounded-full border transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand motion-reduce:transition-none';

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
            only={PARTIAL_PROPS}
            preserveScroll
            preserveState
            prefetch
            aria-label={label}
            className={cn(
                shared,
                'border-ink/15 text-ink hover:border-brand hover:text-brand',
            )}
        >
            {children}
        </Link>
    );
}
