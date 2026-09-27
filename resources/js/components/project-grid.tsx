import { InfiniteScroll } from '@inertiajs/react';
import { ArrowDown } from 'lucide-react';
import { useRef } from 'react';
import ProjectCard from '@/components/project-card';
import { cn } from '@/lib/utils';
import type { ProjectCard as Project } from '@/types';

interface ProjectGridProps {
    /** Name of the `Inertia::scroll()` prop the projects come from. */
    data: string;
    projects: Project[];
    /** Where each card opens. */
    hrefFor: (project: Project) => string;
    /** Another set of projects is on its way: show skeletons instead. */
    loading?: boolean;
    /** Lay each project's tags over its cover, bar `hideTag`. */
    showTags?: boolean;
    hideTag?: string;
    /** Shown when there are no projects at all. */
    emptyMessage: string;
}

/** Covers in the first row fetch with the page; the rest wait for the scroll. */
const EAGER_CARDS = 3;

/** Placeholders shown while a switch loads: two rows of the widest grid. */
const SKELETON_CARDS = 6;

const GRID_CLASS =
    'grid gap-x-4 gap-y-10 @xl:grid-cols-2 @2xl:gap-x-5 @4xl:grid-cols-3';

/** The outline of a project card: its cover, name and details. */
function ProjectCardSkeleton() {
    return (
        <div>
            <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-cream/60 @3xl:rounded-3xl">
                <span className="absolute inset-0 animate-shimmer bg-linear-to-r from-transparent via-white/45 to-transparent motion-reduce:hidden" />
            </div>
            <div className="mt-4 h-5 w-3/5 rounded-full bg-cream/60" />
            <div className="mt-2.5 h-4 w-2/5 rounded-full bg-cream/40" />
        </div>
    );
}

/**
 * A portfolio grid of project cards, nine at a time behind a "Load more"
 * button. Lives inside a `@container`, which sets its columns.
 */
export default function ProjectGrid({
    data,
    projects,
    hrefFor,
    loading = false,
    showTags = false,
    hideTag,
    emptyMessage,
}: ProjectGridProps) {
    const grid = useRef<HTMLDivElement>(null);

    if (projects.length === 0) {
        return (
            <p className="mt-6 rounded-3xl bg-surface px-6 py-16 text-center font-sans text-base text-ink/60">
                {emptyMessage}
            </p>
        );
    }

    return (
        <InfiniteScroll
            data={data}
            manual
            itemsElement={grid}
            next={({ loading: fetching, fetch, hasMore }) =>
                hasMore && (
                    <div className="mt-12 flex justify-center">
                        <button
                            type="button"
                            onClick={fetch}
                            disabled={fetching}
                            className="group inline-flex min-h-11 items-center gap-3 rounded-full bg-brand px-10 py-3.5 text-base text-brand-foreground transition-colors duration-300 ease-out hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand disabled:opacity-60 motion-reduce:transition-none"
                        >
                            {fetching ? 'Loading…' : 'Load more'}
                            <ArrowDown
                                className={cn(
                                    'size-4 transition-transform duration-300 ease-out group-hover:translate-y-0.5 motion-reduce:transition-none',
                                    fetching && 'animate-bounce',
                                )}
                                strokeWidth={1.75}
                            />
                        </button>
                    </div>
                )
            }
        >
            {/* While another set loads, the cards give way to skeletons of
                the same shape. Both swaps wait a moment, so a prefetched
                switch that lands at once never flashes them. */}
            <div className="relative mt-8">
                <div
                    aria-hidden="true"
                    className={cn(
                        'pointer-events-none absolute inset-0 overflow-hidden transition-opacity duration-200 motion-reduce:transition-none',
                        loading ? 'opacity-100 delay-150' : 'opacity-0',
                    )}
                >
                    <div className={GRID_CLASS}>
                        {Array.from(
                            {
                                length: Math.min(
                                    projects.length,
                                    SKELETON_CARDS,
                                ),
                            },
                            (_, index) => (
                                <ProjectCardSkeleton key={index} />
                            ),
                        )}
                    </div>
                </div>
                <div
                    ref={grid}
                    aria-busy={loading}
                    className={cn(
                        GRID_CLASS,
                        'transition-opacity duration-200 motion-reduce:transition-none',
                        loading && 'pointer-events-none opacity-0 delay-150',
                    )}
                >
                    {projects.map((project, index) => (
                        <ProjectCard
                            key={project.slug}
                            href={hrefFor(project)}
                            project={project}
                            eager={index < EAGER_CARDS}
                            showTags={showTags}
                            hideTag={hideTag}
                        />
                    ))}
                </div>
            </div>
        </InfiniteScroll>
    );
}
