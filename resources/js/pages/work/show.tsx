import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import FilterPill from '@/components/filter-pill';
import MarqueeText from '@/components/marquee-text';
import ProjectGrid from '@/components/project-grid';
import { SmartImage } from '@/components/smart-image';
import { useFilterVisit } from '@/lib/use-filter-visit';
import { cn, isPlainClick } from '@/lib/utils';
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

/** A category page, optionally narrowed to one of its tags. */
function tagHref(categorySlug: string, tagSlug?: string | null): string {
    return tagSlug
        ? `/work/${categorySlug}?tag=${encodeURIComponent(tagSlug)}`
        : `/work/${categorySlug}`;
}

/** The underlined look of the category tabs. */
function tabClassName(active: boolean): string {
    return cn(
        '-mb-px inline-flex min-h-11 items-center border-b-2 font-sans whitespace-nowrap transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand motion-reduce:transition-none',
        active
            ? 'border-brand text-brand'
            : 'border-transparent text-ink/55 hover:text-ink',
    );
}

export default function WorkShow({
    category,
    activeTag,
    categories,
    projects,
}: WorkShowProps) {
    // Tag pills swap only the grid: the photo and tabs stay put, and so does
    // the scroll.
    const tagFilter = useFilterVisit({
        active: activeTag,
        activeProp: 'activeTag',
        href: (tagSlug) => tagHref(category.slug, tagSlug),
        only: ['projects', 'activeTag'],
        reset: ['projects'],
    });
    const shownTag = tagFilter.selected;
    // The category being opened, underlined straight away while it loads.
    const [pendingCategory, setPendingCategory] = useState<string | null>(null);
    const shownCategory = pendingCategory ?? category.slug;
    const loading = tagFilter.loading || pendingCategory !== null;

    const current = categories.find((item) => item.slug === category.slug);
    const tags = current?.tags ?? [];
    const shownTagDetails = tags.find((tag) => tag.slug === shownTag);
    // The tag of the projects on screen, which lags the pills while loading.
    const activeTagName = tags.find((tag) => tag.slug === activeTag)?.name;

    /** Opens another category quietly, without the top progress bar. */
    const openCategory = (categorySlug: string) => {
        if (categorySlug === shownCategory) {
            return;
        }

        setPendingCategory(categorySlug);
        router.get(
            tagHref(categorySlug),
            {},
            {
                preserveScroll: true,
                showProgress: false,
                // A category opens as a fresh page, so the pending tab clears
                // itself; letting go on finish instead can flash the old tab
                // for a frame before the new page is on screen.
                onError: () => setPendingCategory(null),
                onCancel: () => setPendingCategory(null),
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
                    one underlined in terracotta. Scrolls sideways on phones
                    when the names don't fit. */}
                {categories.length > 1 && (
                    <nav
                        aria-label="Work categories"
                        className="nav-scroll -mx-5 mt-8 overflow-x-auto px-5 md:-mx-8 md:px-8 lg:mr-0 lg:ml-0 lg:px-0"
                    >
                        <ul className="flex min-w-max gap-7 border-b border-ink/10 @lg:gap-10">
                            {categories.map((item) => {
                                const active = item.slug === shownCategory;

                                return (
                                    <li key={item.slug}>
                                        <Link
                                            href={tagHref(item.slug)}
                                            prefetch
                                            onClick={(event) => {
                                                if (isPlainClick(event)) {
                                                    event.preventDefault();
                                                    openCategory(item.slug);
                                                }
                                            }}
                                            aria-current={
                                                active ? 'page' : undefined
                                            }
                                            className={cn(
                                                tabClassName(active),
                                                'text-base @lg:text-lg',
                                            )}
                                        >
                                            {item.name}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>
                )}

                {/* The category's tags as pills under the tabs, "All" first;
                    hidden when the category has none. */}
                {tags.length > 0 && (
                    <nav
                        aria-label={`${category.name} tags`}
                        className="nav-scroll -mx-5 mt-5 overflow-x-auto px-5 pb-1 md:-mx-8 md:px-8 lg:mr-0 lg:ml-0 lg:px-0"
                    >
                        <ul className="flex min-w-max gap-2 lg:min-w-0 lg:flex-wrap">
                            <li>
                                <FilterPill
                                    href={tagHref(category.slug)}
                                    active={shownTag === null}
                                    onSelect={() => tagFilter.select(null)}
                                    onPrefetch={() => tagFilter.prefetch(null)}
                                >
                                    All
                                </FilterPill>
                            </li>
                            {tags.map((tag) => (
                                <li key={tag.slug}>
                                    <FilterPill
                                        href={tagHref(category.slug, tag.slug)}
                                        active={shownTag === tag.slug}
                                        onSelect={() =>
                                            tagFilter.select(tag.slug)
                                        }
                                        onPrefetch={() =>
                                            tagFilter.prefetch(tag.slug)
                                        }
                                    >
                                        {tag.name}
                                    </FilterPill>
                                </li>
                            ))}
                        </ul>
                    </nav>
                )}

                <h2 className="sr-only">Projects</h2>

                <ProjectGrid
                    data="projects"
                    projects={projects.data}
                    hrefFor={(project) =>
                        `/work/${category.slug}/${project.slug}`
                    }
                    loading={loading}
                    // On a filtered grid, only the tags besides the one
                    // filtered by.
                    showTags={tags.length > 0}
                    hideTag={activeTagName}
                    emptyMessage={
                        activeTag
                            ? 'No projects under this tag yet.'
                            : 'Projects are being photographed. Check back soon.'
                    }
                />
            </div>
        </>
    );
}
