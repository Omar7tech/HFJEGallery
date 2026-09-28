import { Link } from '@inertiajs/react';
import { SmartImage } from '@/components/smart-image';
import type { ProjectCard as Project } from '@/types';

interface ProjectCardProps {
    /** Where the card opens: the project's own page. */
    href: string;
    project: Project;
    /** Above the fold: fetch the cover with the page instead of lazily. */
    eager?: boolean;
    /** Lay the project's tags over the cover. */
    showTags?: boolean;
    /** A tag left off the cover, e.g. the one the grid is filtered by. */
    hideTag?: string;
}

/** Tags shown on the cover; any beyond fold into a "+N". */
const VISIBLE_TAGS = 2;

/**
 * A project in a portfolio grid: the cover, then the name and where / when
 * underneath. The photo leans in slightly on hover.
 */
export default function ProjectCard({
    href,
    project,
    eager = false,
    showTags = false,
    hideTag,
}: ProjectCardProps) {
    const meta = [project.location, project.year].filter(Boolean).join(' · ');
    const tags = showTags
        ? (project.tags ?? []).filter((tag) => tag !== hideTag)
        : [];
    const moreTags = tags.length - VISIBLE_TAGS;

    return (
        <Link
            href={href}
            prefetch
            className="group block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
        >
            <SmartImage
                src={project.image}
                alt={project.name}
                loading={eager ? 'eager' : 'lazy'}
                fetchPriority={eager ? 'high' : undefined}
                className="aspect-4/3 rounded-2xl max-md:aspect-3/2 @3xl:rounded-3xl"
                imgClassName="object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            >
                {tags.length > 0 && (
                    <span className="pointer-events-none absolute top-3 left-3 flex max-w-[calc(100%-1.5rem)] flex-wrap gap-1.5 @3xl:top-4 @3xl:left-4">
                        {tags.slice(0, VISIBLE_TAGS).map((tag) => (
                            <span
                                key={tag}
                                className="truncate rounded-full bg-white/90 px-3 py-1 font-sans text-xs text-ink shadow-[0_4px_14px_-6px_rgb(0_0_0/0.35)] backdrop-blur"
                            >
                                {tag}
                            </span>
                        ))}
                        {moreTags > 0 && (
                            <span className="rounded-full bg-white/90 px-2.5 py-1 font-sans text-xs text-ink/60 shadow-[0_4px_14px_-6px_rgb(0_0_0/0.35)] backdrop-blur">
                                +{moreTags}
                            </span>
                        )}
                    </span>
                )}
            </SmartImage>

            <h3 className="mt-4 font-display text-[clamp(1rem,2.2cqi,1.3rem)] leading-snug text-ink transition-colors duration-300 group-hover:text-brand max-md:mt-3 max-md:text-lg">
                {project.name}
            </h3>
            {meta && (
                <p className="mt-1.5 font-sans text-base text-ink/60 max-md:mt-1 max-md:text-sm">
                    {meta}
                </p>
            )}
        </Link>
    );
}
