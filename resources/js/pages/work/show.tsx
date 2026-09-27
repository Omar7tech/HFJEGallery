import { Head, InfiniteScroll, Link, router } from '@inertiajs/react';
import { ArrowDown, ArrowLeft, ChevronDown, X } from 'lucide-react';
import type { MouseEvent, ReactNode } from 'react';
import { useRef, useState } from 'react';
import MarqueeText from '@/components/marquee-text';
import ProjectCard from '@/components/project-card';
import { SmartImage } from '@/components/smart-image';
import { cn } from '@/lib/utils';
import type {
    ProjectCard as Project,
    WorkCategoryLink,
    WorkCategoryNavItem,
} from '@/types';

interface WorkShowProps {
    category: WorkCategoryLink & {
        description: string | null;
        image: string;
    };
    /** Slug of the tag the grid is narrowed to, or null for every project. */
    activeTag: string | null;
    categories: WorkCategoryNavItem[];
    projects: { data: Project[] };
}

/** Covers in the first row fetch with the page; the rest wait for the scroll. */
const EAGER_CARDS = 3;

/** A category page, optionally narrowed to one of its tags. */
function tagHref(categorySlug: string, tagSlug?: string | null): string {
    return tagSlug
        ? `/work/${categorySlug}?tag=${encodeURIComponent(tagSlug)}`
        : `/work/${categorySlug}`;
}

/** Keeps new-tab and modified clicks working as plain links. */
function isPlainClick(event: MouseEvent): boolean {
    return (
        event.button === 0 &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.shiftKey &&
        !event.altKey
    );
}

interface TagChipProps {
    href: string;
    active: boolean;
    onSelect: () => void;
    children: ReactNode;
}

/**
 * A pill filtering the current category. A real link, so it can be opened in
 * a new tab, but a plain click swaps the grid in place.
 */
function TagChip({ href, active, onSelect, children }: TagChipProps) {
    return (
        <a
            href={href}
            aria-current={active ? 'page' : undefined}
            onClick={(event) => {
                if (isPlainClick(event)) {
                    event.preventDefault();
                    onSelect();
                }
            }}
            className={cn(
                'inline-flex min-h-10 items-center rounded-full border px-4 font-sans text-sm whitespace-nowrap transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand motion-reduce:transition-none',
                active
                    ? 'border-ink bg-ink text-cream'
                    : 'border-ink/15 bg-white/60 text-ink/75 hover:border-ink/40 hover:text-ink',
            )}
        >
            {children}
        </a>
    );
}

/** One row of a category tab's dropdown. */
function TagMenuLink({
    href,
    children,
}: {
    href: string;
    children: ReactNode;
}) {
    return (
        <Link
            href={href}
            prefetch="hover"
            className="flex min-h-10 items-center rounded-xl px-3.5 font-sans text-[15px] whitespace-nowrap text-ink/75 transition-colors duration-150 hover:bg-ink/5 hover:text-ink focus-visible:bg-ink/5 focus-visible:outline-none motion-reduce:transition-none"
        >
            {children}
        </Link>
    );
}

export default function WorkShow({
    category,
    activeTag,
    categories,
    projects,
}: WorkShowProps) {
    const grid = useRef<HTMLDivElement>(null);
    // The tag picked while its projects are still loading, so the chips answer
    // the click at once; undefined when nothing is in flight.
    const [pendingTag, setPendingTag] = useState<string | null | undefined>();
    const filtering = pendingTag !== undefined;
    const shownTag = filtering ? pendingTag : activeTag;

    const current = categories.find((item) => item.slug === category.slug);
    const tags = current?.tags ?? [];
    const shownTagDetails = tags.find((tag) => tag.slug === shownTag);

    /** Swaps only the grid: the photo and tabs stay put, and so does the scroll. */
    const filterBy = (tagSlug: string | null) => {
        if (tagSlug === shownTag) {
            return;
        }

        setPendingTag(tagSlug);
        router.get(
            tagHref(category.slug, tagSlug),
            {},
            {
                only: ['projects', 'activeTag'],
                reset: ['projects'],
                preserveState: true,
                preserveScroll: true,
                onFinish: () => setPendingTag(undefined),
            },
        );
    };

    return (
        <>
            <Head
                title={
                    shownTagDetails
                        ? `${shownTagDetails.name} · ${category.name} · Work`
                        : `${category.name} · Work`
                }
            >
                <meta
                    name="description"
                    content={
                        category.description ??
                        `${category.name} crafted by HFJE.`
                    }
                />
            </Head>

            <div className="@container px-5 pt-6 pb-20 md:px-8 md:pb-24 lg:pr-7 lg:pl-0">
                {/* Category photo with its name laid over the foot — the LCP
                    image, so it is fetched eagerly at high priority. */}
                <SmartImage
                    src={category.image}
                    alt=""
                    loading="eager"
                    fetchPriority="high"
                    className="h-[52svh] max-h-160 min-h-80 rounded-3xl md:rounded-[36px] lg:h-[68svh]"
                    imgClassName="object-cover"
                >
                    <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 bg-linear-to-t from-ink/70 via-ink/15 to-transparent"
                    />
                    <span className="absolute inset-x-0 bottom-0 block min-w-0 p-6 @lg:p-10">
                        <Link
                            href="/work"
                            className="inline-flex items-center gap-2 text-sm tracking-[0.15em] text-cream uppercase transition-colors hover:text-white"
                        >
                            <ArrowLeft className="size-4" strokeWidth={1.75} />
                            All work
                        </Link>
                        {/* One line always: a long name loops like the
                            category cards instead of wrapping. */}
                        <h1 className="mt-3 font-display text-[clamp(2rem,7.5cqi,5.5rem)] leading-[1.05] tracking-[-0.02em] text-white uppercase">
                            <MarqueeText speed={60}>
                                {category.name}
                            </MarqueeText>
                        </h1>
                        {category.description && (
                            <p className="mt-3 max-w-xl font-sans text-base leading-relaxed text-cream/90">
                                {category.description}
                            </p>
                        )}
                    </span>
                </SmartImage>

                {/* Switch between categories: plain text tabs, the active
                    one underlined in terracotta. Hovering another category
                    that has tags (after a short pause, so sweeping across the
                    tabs doesn't flash menus) drops its tags, to jump straight
                    into one. The current category's tags are the chips below,
                    so its own tab has no menu. Scrolls sideways on phones. */}
                {categories.length > 1 && (
                    <nav
                        aria-label="Work categories"
                        className="nav-scroll -mx-5 mt-8 overflow-x-auto px-5 md:-mx-8 md:px-8 lg:mr-0 lg:ml-0 lg:overflow-visible lg:px-0"
                    >
                        <ul className="flex min-w-max gap-7 border-b border-ink/10 lg:min-w-0 lg:flex-wrap @lg:gap-10">
                            {categories.map((item) => {
                                const active = item.slug === category.slug;
                                const hasMenu = !active && item.tags.length > 0;

                                return (
                                    <li
                                        key={item.slug}
                                        className="group/tab relative"
                                    >
                                        <Link
                                            href={tagHref(item.slug)}
                                            prefetch
                                            preserveScroll
                                            aria-current={
                                                active ? 'page' : undefined
                                            }
                                            className={cn(
                                                '-mb-px inline-flex min-h-11 items-center gap-1 border-b-2 font-sans text-base whitespace-nowrap transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand motion-reduce:transition-none @lg:text-lg',
                                                active
                                                    ? 'border-brand text-brand'
                                                    : 'border-transparent text-ink/55 hover:text-ink',
                                            )}
                                        >
                                            {item.name}
                                            {hasMenu && (
                                                <ChevronDown
                                                    aria-hidden="true"
                                                    className="hidden size-4 opacity-50 transition-transform duration-200 group-focus-within/tab:rotate-180 group-hover/tab:rotate-180 motion-reduce:transition-none lg:block"
                                                    strokeWidth={1.75}
                                                />
                                            )}
                                        </Link>

                                        {/* The padding bridges the gap to the
                                            tab, so the pointer can travel into
                                            the panel without it closing. */}
                                        {hasMenu && (
                                            <div className="invisible absolute top-full left-1/2 z-30 hidden -translate-x-1/2 translate-y-1 pt-3 opacity-0 transition-[opacity,translate,visibility] duration-200 ease-out group-focus-within/tab:visible group-focus-within/tab:translate-y-0 group-focus-within/tab:opacity-100 group-hover/tab:visible group-hover/tab:translate-y-0 group-hover/tab:opacity-100 group-hover/tab:delay-150 motion-reduce:transition-none lg:block">
                                                <ul className="min-w-60 rounded-2xl bg-white p-2 shadow-[0_18px_40px_-16px_rgb(0_0_0/0.25)] ring-1 ring-ink/10">
                                                    <li>
                                                        <TagMenuLink
                                                            href={tagHref(
                                                                item.slug,
                                                            )}
                                                        >
                                                            All {item.name}
                                                        </TagMenuLink>
                                                    </li>
                                                    <li
                                                        aria-hidden="true"
                                                        className="mx-3.5 my-1 border-t border-ink/8"
                                                    />
                                                    {item.tags.map((tag) => (
                                                        <li key={tag.slug}>
                                                            <TagMenuLink
                                                                href={tagHref(
                                                                    item.slug,
                                                                    tag.slug,
                                                                )}
                                                            >
                                                                {tag.name}
                                                            </TagMenuLink>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>
                )}

                {/* Filter the grid by the category's tags: one tap swaps the
                    projects in place, tapping the active chip again clears
                    it. Scrolls sideways on phones. */}
                {tags.length > 0 && (
                    <nav
                        aria-label={`Filter ${category.name}`}
                        className="nav-scroll -mx-5 mt-6 overflow-x-auto px-5 pb-1 md:-mx-8 md:px-8 lg:mr-0 lg:ml-0 lg:px-0"
                    >
                        <ul className="flex min-w-max gap-2 lg:min-w-0 lg:flex-wrap">
                            <li>
                                <TagChip
                                    href={tagHref(category.slug)}
                                    active={shownTag === null}
                                    onSelect={() => filterBy(null)}
                                >
                                    All
                                </TagChip>
                            </li>
                            {tags.map((tag) => (
                                <li key={tag.slug}>
                                    <TagChip
                                        href={tagHref(category.slug, tag.slug)}
                                        active={shownTag === tag.slug}
                                        onSelect={() =>
                                            filterBy(
                                                shownTag === tag.slug
                                                    ? null
                                                    : tag.slug,
                                            )
                                        }
                                    >
                                        {tag.name}
                                    </TagChip>
                                </li>
                            ))}
                        </ul>
                    </nav>
                )}

                {/* A way back out of a filter. */}
                {shownTagDetails && (
                    <button
                        type="button"
                        onClick={() => filterBy(null)}
                        className="mt-4 inline-flex min-h-8 items-center gap-1 rounded-full font-sans text-sm text-brand transition-colors hover:text-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    >
                        <X className="size-3.5" strokeWidth={2} />
                        Clear filter
                    </button>
                )}

                <h2 className="sr-only">Projects</h2>

                {projects.data.length > 0 ? (
                    <InfiniteScroll
                        data="projects"
                        manual
                        itemsElement={grid}
                        next={({ loading, fetch, hasMore }) =>
                            hasMore && (
                                <div className="mt-12 flex justify-center">
                                    <button
                                        type="button"
                                        onClick={fetch}
                                        disabled={loading}
                                        className="group inline-flex min-h-11 items-center gap-3 rounded-full bg-brand px-10 py-3.5 text-base text-brand-foreground transition-colors duration-300 ease-out hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand disabled:opacity-60 motion-reduce:transition-none"
                                    >
                                        {loading ? 'Loading…' : 'Load more'}
                                        <ArrowDown
                                            className={cn(
                                                'size-4 transition-transform duration-300 ease-out group-hover:translate-y-0.5 motion-reduce:transition-none',
                                                loading && 'animate-bounce',
                                            )}
                                            strokeWidth={1.75}
                                        />
                                    </button>
                                </div>
                            )
                        }
                    >
                        {/* Dims while a filter loads, so the old projects
                            don't read as the answer. */}
                        <div
                            ref={grid}
                            aria-busy={filtering}
                            className={cn(
                                'grid gap-x-4 gap-y-10 transition-opacity duration-300 motion-reduce:transition-none @xl:grid-cols-2 @2xl:gap-x-5 @4xl:grid-cols-3',
                                tags.length > 0 ? 'mt-6' : 'mt-8',
                                filtering && 'pointer-events-none opacity-40',
                            )}
                        >
                            {projects.data.map((project, index) => (
                                <ProjectCard
                                    key={project.slug}
                                    categorySlug={category.slug}
                                    project={project}
                                    eager={index < EAGER_CARDS}
                                />
                            ))}
                        </div>
                    </InfiniteScroll>
                ) : (
                    <p className="mt-6 rounded-3xl bg-[#f2f1ef] px-6 py-16 text-center font-sans text-base text-ink/60">
                        {activeTag
                            ? 'No projects under this tag yet.'
                            : 'Projects are being photographed. Check back soon.'}
                    </p>
                )}
            </div>
        </>
    );
}
