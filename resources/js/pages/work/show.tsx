import { Head, InfiniteScroll, Link } from '@inertiajs/react';
import { ArrowDown, ArrowLeft, ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';
import { useRef } from 'react';
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

interface TagLinkProps {
    href: string;
    active: boolean;
    children: ReactNode;
}

/** Covers in the first row fetch with the page; the rest wait for the scroll. */
const EAGER_CARDS = 3;

/** A category page, optionally narrowed to one of its tags. */
function tagHref(categorySlug: string, tagSlug?: string): string {
    return tagSlug
        ? `/work/${categorySlug}?tag=${encodeURIComponent(tagSlug)}`
        : `/work/${categorySlug}`;
}

/** One row of a category tab's dropdown. */
function TagMenuLink({ href, active, children }: TagLinkProps) {
    return (
        <Link
            href={href}
            prefetch
            preserveScroll
            aria-current={active ? 'page' : undefined}
            className={cn(
                'flex min-h-10 items-center rounded-xl px-3.5 font-sans text-[15px] whitespace-nowrap transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-brand motion-reduce:transition-none',
                active
                    ? 'bg-brand/10 text-brand'
                    : 'text-ink/70 hover:bg-ink/5 hover:text-ink',
            )}
        >
            {children}
        </Link>
    );
}

/** A pill filtering the current category by one of its tags. */
function TagChip({ href, active, children }: TagLinkProps) {
    return (
        <Link
            href={href}
            preserveScroll
            aria-current={active ? 'page' : undefined}
            className={cn(
                'inline-flex min-h-10 items-center rounded-full border px-4 font-sans text-sm whitespace-nowrap transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand motion-reduce:transition-none',
                active
                    ? 'border-brand bg-brand text-brand-foreground'
                    : 'border-ink/15 text-ink/70 hover:border-ink/40 hover:text-ink',
            )}
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
    const tags =
        categories.find((item) => item.slug === category.slug)?.tags ?? [];
    const activeTagName = tags.find((tag) => tag.slug === activeTag)?.name;

    return (
        <>
            <Head
                title={
                    activeTagName
                        ? `${activeTagName} · ${category.name} · Work`
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
                    one underlined in terracotta. A category with tags shows a
                    chevron and, on hover or keyboard focus, drops its tags
                    under the tab. Scrolls sideways on phones, where the tag
                    chips below take over from the dropdown. */}
                {categories.length > 1 && (
                    <nav
                        aria-label="Work categories"
                        className="nav-scroll -mx-5 mt-8 overflow-x-auto px-5 md:-mx-8 md:px-8 lg:mr-0 lg:ml-0 lg:overflow-visible lg:px-0"
                    >
                        <ul className="flex min-w-max gap-7 border-b border-ink/10 lg:min-w-0 lg:flex-wrap @lg:gap-10">
                            {categories.map((item) => {
                                const active = item.slug === category.slug;
                                const hasTags = item.tags.length > 0;

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
                                                '-mb-px inline-flex min-h-11 items-center gap-1.5 border-b-2 font-sans text-base whitespace-nowrap transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand motion-reduce:transition-none @lg:text-lg',
                                                active
                                                    ? 'border-brand text-brand'
                                                    : 'border-transparent text-ink/55 hover:text-ink',
                                            )}
                                        >
                                            {item.name}
                                            {hasTags && (
                                                <ChevronDown
                                                    aria-hidden="true"
                                                    className="size-4 transition-transform duration-200 group-focus-within/tab:rotate-180 group-hover/tab:rotate-180 motion-reduce:transition-none"
                                                    strokeWidth={1.75}
                                                />
                                            )}
                                        </Link>

                                        {/* The padding bridges the gap to the
                                            tab, so the pointer can travel into
                                            the panel without it closing. */}
                                        {hasTags && (
                                            <div className="invisible absolute top-full left-0 z-30 hidden translate-y-1 pt-2 opacity-0 transition duration-200 ease-out group-focus-within/tab:visible group-focus-within/tab:translate-y-0 group-focus-within/tab:opacity-100 group-hover/tab:visible group-hover/tab:translate-y-0 group-hover/tab:opacity-100 motion-reduce:transition-none lg:block">
                                                <ul className="min-w-56 rounded-2xl bg-white p-2 shadow-[0_18px_40px_-16px_rgb(0_0_0/0.25)] ring-1 ring-ink/10">
                                                    <li>
                                                        <TagMenuLink
                                                            href={tagHref(
                                                                item.slug,
                                                            )}
                                                            active={
                                                                active &&
                                                                activeTag ===
                                                                    null
                                                            }
                                                        >
                                                            All {item.name}
                                                        </TagMenuLink>
                                                    </li>
                                                    {item.tags.map((tag) => (
                                                        <li key={tag.slug}>
                                                            <TagMenuLink
                                                                href={tagHref(
                                                                    item.slug,
                                                                    tag.slug,
                                                                )}
                                                                active={
                                                                    active &&
                                                                    activeTag ===
                                                                        tag.slug
                                                                }
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

                {/* The tags of this category as chips: the filter on touch
                    screens, and a visible reminder of the active one. */}
                {tags.length > 0 && (
                    <nav
                        aria-label={`${category.name} tags`}
                        className="nav-scroll -mx-5 mt-5 overflow-x-auto px-5 pb-1 md:-mx-8 md:px-8 lg:mr-0 lg:ml-0 lg:px-0"
                    >
                        <ul className="flex min-w-max gap-2 lg:min-w-0 lg:flex-wrap">
                            <li>
                                <TagChip
                                    href={tagHref(category.slug)}
                                    active={activeTag === null}
                                >
                                    All
                                </TagChip>
                            </li>
                            {tags.map((tag) => (
                                <li key={tag.slug}>
                                    <TagChip
                                        href={tagHref(category.slug, tag.slug)}
                                        active={activeTag === tag.slug}
                                    >
                                        {tag.name}
                                    </TagChip>
                                </li>
                            ))}
                        </ul>
                    </nav>
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
                        <div
                            ref={grid}
                            className="mt-8 grid gap-x-4 gap-y-10 @xl:grid-cols-2 @2xl:gap-x-5 @4xl:grid-cols-3"
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
                        Projects are being photographed. Check back soon.
                    </p>
                )}
            </div>
        </>
    );
}
