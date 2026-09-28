import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import FilterPill from '@/components/filter-pill';
import MarqueeText from '@/components/marquee-text';
import ProjectGrid from '@/components/project-grid';
import { SmartImage } from '@/components/smart-image';
import { useFilterVisit } from '@/lib/use-filter-visit';
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
    /** Slug of the category shown. */
    activeCategory: string;
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

/** Starts downloading an image, so it is cached before it is shown. */
function preloadImage(src: string): void {
    const image = new Image();
    image.src = src;
}

export default function WorkShow({
    category,
    activeCategory,
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
    // Category tabs swap the page in place too, without remounting it: the
    // tab moves at once, the grid gives way to skeletons, and the photo and
    // name follow as soon as the category lands. Hovering a tab also fetches
    // its photo, so the swap shows no empty frame.
    const categoryFilter = useFilterVisit({
        active: activeCategory,
        activeProp: 'activeCategory',
        href: (categorySlug) => tagHref(categorySlug ?? activeCategory),
        only: ['category', 'activeCategory', 'activeTag', 'projects'],
        reset: ['projects'],
    });
    const loading = tagFilter.loading || categoryFilter.loading;

    const current = categories.find((item) => item.slug === category.slug);
    const tags = current?.tags ?? [];
    const shownTagDetails = tags.find((tag) => tag.slug === shownTag);
    // The tag of the projects on screen, which lags the pills while loading.
    const activeTagName = tags.find((tag) => tag.slug === activeTag)?.name;

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

            <div className="@container px-5 pt-6 pb-20 max-md:pt-3 max-md:pb-12 md:px-8 md:pb-24 lg:pr-7 lg:pl-0">
                {/* Category photo with its name laid over the foot — the LCP
                    image, so it is fetched eagerly at high priority. */}
                <SmartImage
                    src={category.image}
                    alt=""
                    loading="eager"
                    fetchPriority="high"
                    className="h-[52svh] max-h-160 min-h-80 rounded-3xl max-md:h-[42svh] max-md:min-h-72 md:rounded-[36px] lg:h-[68svh]"
                    imgClassName="object-cover"
                >
                    <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 bg-linear-to-t from-ink/70 via-ink/15 to-transparent"
                    />
                    <span className="absolute inset-x-0 bottom-0 block min-w-0 p-6 max-md:p-5 @lg:p-10">
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
                            <MarqueeText speed={60} wrapOnPhones>
                                {category.name}
                            </MarqueeText>
                        </h1>
                        {category.description && (
                            <p className="mt-3 max-w-xl font-sans text-base leading-relaxed text-cream/90 max-md:mt-2 max-md:line-clamp-2 max-md:text-sm">
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
                        className="nav-scroll -mx-5 mt-8 overflow-x-auto px-5 max-md:mt-5 md:-mx-8 md:px-8 lg:mr-0 lg:ml-0 lg:px-0"
                    >
                        <ul className="flex min-w-max gap-7 border-b border-ink/10 @lg:gap-10">
                            {categories.map((item) => (
                                <li key={item.slug}>
                                    <FilterPill
                                        variant="tab"
                                        href={tagHref(item.slug)}
                                        active={
                                            item.slug ===
                                            categoryFilter.selected
                                        }
                                        onSelect={() => {
                                            preloadImage(item.image);
                                            categoryFilter.select(item.slug);
                                        }}
                                        onPrefetch={() => {
                                            preloadImage(item.image);
                                            categoryFilter.prefetch(item.slug);
                                        }}
                                    >
                                        {item.name}
                                    </FilterPill>
                                </li>
                            ))}
                        </ul>
                    </nav>
                )}

                {/* The category's tags as pills under the tabs, "All" first;
                    hidden when the category has none. */}
                {tags.length > 0 && (
                    <nav
                        aria-label={`${category.name} tags`}
                        className="nav-scroll -mx-5 mt-5 overflow-x-auto px-5 pb-1 max-md:mt-4 md:-mx-8 md:px-8 lg:mr-0 lg:ml-0 lg:px-0"
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
