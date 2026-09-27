import { Head, InfiniteScroll, Link } from '@inertiajs/react';
import { ArrowDown, ArrowLeft } from 'lucide-react';
import { useRef } from 'react';
import ProjectCard from '@/components/project-card';
import { SmartImage } from '@/components/smart-image';
import { cn } from '@/lib/utils';
import type { ProjectCard as Project, WorkCategoryLink } from '@/types';

interface WorkShowProps {
    category: WorkCategoryLink & {
        description: string | null;
        image: string;
    };
    categories: WorkCategoryLink[];
    projects: { data: Project[] };
}

/** Covers in the first row fetch with the page; the rest wait for the scroll. */
const EAGER_CARDS = 3;

export default function WorkShow({
    category,
    categories,
    projects,
}: WorkShowProps) {
    const grid = useRef<HTMLDivElement>(null);

    return (
        <>
            <Head title={`${category.name} · Work`}>
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
                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/5 to-transparent"
                    />
                    <span className="absolute inset-x-0 bottom-0 p-6 @lg:p-10">
                        <Link
                            href="/work"
                            className="inline-flex items-center gap-2 text-sm tracking-[0.15em] text-cream uppercase transition-colors hover:text-white"
                        >
                            <ArrowLeft className="size-4" strokeWidth={1.75} />
                            All work
                        </Link>
                        <h1 className="mt-3 font-display text-[clamp(2rem,7.5cqi,5.5rem)] leading-[1.05] tracking-[-0.02em] text-white uppercase">
                            {category.name}
                        </h1>
                    </span>
                </SmartImage>

                <div className="mt-8 flex flex-col gap-6 @3xl:flex-row @3xl:items-start @3xl:justify-between">
                    {category.description && (
                        <p className="max-w-xl font-sans text-base leading-relaxed text-brand">
                            {category.description}
                        </p>
                    )}

                    {categories.length > 1 && (
                        <nav
                            aria-label="Work categories"
                            className="nav-scroll -mx-5 flex snap-x gap-2 overflow-x-auto px-5 pb-2 md:-mx-8 md:px-8 @3xl:mx-0 @3xl:flex-wrap @3xl:justify-end @3xl:overflow-visible @3xl:px-0"
                        >
                            {categories.map((item) => {
                                const active = item.slug === category.slug;

                                return (
                                    <Link
                                        key={item.slug}
                                        href={`/work/${item.slug}`}
                                        prefetch
                                        aria-current={
                                            active ? 'page' : undefined
                                        }
                                        className={cn(
                                            'inline-flex h-10 shrink-0 snap-start items-center rounded-full border px-4 text-sm whitespace-nowrap transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand motion-reduce:transition-none',
                                            active
                                                ? 'border-brand bg-brand text-brand-foreground'
                                                : 'border-ink/15 text-ink/70 hover:border-ink/40 hover:text-ink',
                                        )}
                                    >
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>
                    )}
                </div>

                <h2 className="mt-12 border-b border-ink/10 pb-4 font-sans text-sm tracking-[0.15em] text-ink uppercase @lg:text-base">
                    Projects
                </h2>

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
                            className="mt-6 grid gap-x-4 gap-y-10 @xl:grid-cols-2 @2xl:gap-x-5 @4xl:grid-cols-3"
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
