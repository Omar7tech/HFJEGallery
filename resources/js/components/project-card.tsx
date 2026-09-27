import { Link } from '@inertiajs/react';
import { SmartImage } from '@/components/smart-image';
import type { ProjectCard as Project } from '@/types';

interface ProjectCardProps {
    categorySlug: string;
    project: Project;
    /** Above the fold: fetch the cover with the page instead of lazily. */
    eager?: boolean;
}

/**
 * A project in a category grid: the cover, then the name and where / when
 * underneath. The photo leans in slightly on hover.
 */
export default function ProjectCard({
    categorySlug,
    project,
    eager = false,
}: ProjectCardProps) {
    const meta = [project.location, project.year].filter(Boolean).join(' · ');

    return (
        <Link
            href={`/work/${categorySlug}/${project.slug}`}
            prefetch
            className="group block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
        >
            <SmartImage
                src={project.image}
                alt={project.name}
                loading={eager ? 'eager' : 'lazy'}
                fetchPriority={eager ? 'high' : undefined}
                className="aspect-4/3 rounded-2xl @3xl:rounded-3xl"
                imgClassName="object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />

            <h3 className="mt-4 font-display text-[clamp(1rem,2.2cqi,1.3rem)] leading-snug text-ink transition-colors duration-300 group-hover:text-brand">
                {project.name}
            </h3>
            {meta && (
                <p className="mt-1.5 font-sans text-base text-ink/60">{meta}</p>
            )}
        </Link>
    );
}
