import LoadMoreGrid from '@/components/load-more-grid';
import ProjectCard from '@/components/project-card';
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

/** The outline of a project card: its cover, name and details. */
const skeleton = (
    <>
        <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-cream/60 @3xl:rounded-3xl">
            <span className="absolute inset-0 animate-shimmer bg-linear-to-r from-transparent via-white/45 to-transparent motion-reduce:hidden" />
        </div>
        <div className="mt-4 h-5 w-3/5 rounded-full bg-cream/60" />
        <div className="mt-2.5 h-4 w-2/5 rounded-full bg-cream/40" />
    </>
);

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
    if (projects.length === 0) {
        return (
            <p className="mt-6 rounded-3xl bg-surface px-6 py-16 text-center font-sans text-base text-ink/60">
                {emptyMessage}
            </p>
        );
    }

    return (
        <LoadMoreGrid
            data={data}
            count={projects.length}
            className="grid gap-x-4 gap-y-10 max-md:gap-y-7 @xl:grid-cols-2 @2xl:gap-x-5 @4xl:grid-cols-3"
            skeleton={skeleton}
            loading={loading}
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
        </LoadMoreGrid>
    );
}
