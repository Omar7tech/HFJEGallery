import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, CalendarDays, MapPin } from 'lucide-react';
import MarqueeText from '@/components/marquee-text';
import ProjectGallery from '@/components/project-gallery';
import { SmartImage } from '@/components/smart-image';
import type { ProjectDetail as Project, ProjectLink } from '@/types';

interface ProjectDetailProps {
    project: Project;
    /** Where the project belongs: the back link and the pill beside its details. */
    parent: { name: string; href: string };
    /** The project after this one, and where it opens; null when there is none. */
    next: (ProjectLink & { href: string }) | null;
}

/**
 * A portfolio project's page: its name, where and when, the cover, the story,
 * the gallery and a link on to the next project.
 */
export default function ProjectDetail({
    project,
    parent,
    next,
}: ProjectDetailProps) {
    // Where and when, shown beside the parent pill; either may be blank.
    const details = [
        { icon: MapPin, text: project.location },
        { icon: CalendarDays, text: project.year?.toString() },
    ].filter((detail): detail is { icon: typeof MapPin; text: string } =>
        Boolean(detail.text),
    );

    return (
        <>
            <Head title={`${project.name} · ${parent.name}`}>
                <meta
                    name="description"
                    content={
                        project.summary ?? `${project.name} crafted by HFJE.`
                    }
                />
                <meta property="og:image" content={project.cover} />
            </Head>

            <div className="@container px-5 pt-6 pb-20 md:px-8 md:pb-24 lg:pt-10 lg:pr-7 lg:pl-0">
                <Link
                    href={parent.href}
                    className="inline-flex items-center gap-2 text-sm tracking-[0.15em] text-ink/60 uppercase transition-colors hover:text-brand"
                >
                    <ArrowLeft className="size-4" strokeWidth={1.75} />
                    {parent.name}
                </Link>

                {/* One line always: a long name loops like the category
                    titles instead of wrapping. */}
                <h1 className="mt-5 font-display text-[clamp(1.5rem,4.2cqi,2.75rem)] leading-[1.15] text-ink">
                    <MarqueeText speed={40}>{project.name}</MarqueeText>
                </h1>

                {/* Parent pill, then where and when, on one quiet line. */}
                <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 font-sans text-base text-ink/60">
                    <Link
                        href={parent.href}
                        className="inline-flex h-8 items-center rounded-full bg-brand/10 px-3.5 text-sm text-brand transition-colors hover:bg-brand hover:text-brand-foreground"
                    >
                        {parent.name}
                    </Link>
                    {details.map(({ icon: Icon, text }) => (
                        <span
                            key={text}
                            className="inline-flex items-center gap-1.5"
                        >
                            <Icon
                                aria-hidden="true"
                                className="size-4 text-brand/70"
                                strokeWidth={1.5}
                            />
                            {text}
                        </span>
                    ))}
                </div>

                {/* The cover is the LCP image: fetched eagerly at high priority. */}
                <SmartImage
                    src={project.cover}
                    alt={project.name}
                    loading="eager"
                    fetchPriority="high"
                    className="mt-8 h-[56svh] max-h-190 min-h-72 rounded-3xl md:rounded-[36px] lg:h-[72svh]"
                    imgClassName="object-cover"
                />

                {/* The story, kept compact: the summary as a lead line, then
                    the rich-text story flowing in balanced columns so long
                    text never leaves gaps. */}
                {(project.summary || project.description) && (
                    <section
                        aria-label="About the project"
                        className="mt-10 @3xl:mt-12"
                    >
                        {project.summary && (
                            <p className="max-w-4xl font-sans text-[clamp(1.2rem,2.2cqi,1.6rem)] leading-snug font-medium text-ink">
                                {project.summary}
                            </p>
                        )}

                        {project.description && (
                            <div
                                className="rich-text mt-5 gap-10 @3xl:columns-2"
                                // Sanitized on the server by Filament's rich
                                // content renderer before it reaches the page.
                                dangerouslySetInnerHTML={{
                                    __html: project.description,
                                }}
                            />
                        )}
                    </section>
                )}

                {project.gallery.length > 0 && (
                    <section className="mt-16" aria-label="Gallery">
                        <h2 className="mb-6 border-b border-ink/10 pb-4 font-sans text-sm tracking-[0.15em] text-ink uppercase @lg:text-base">
                            Gallery
                        </h2>
                        <ProjectGallery
                            images={project.gallery}
                            projectName={project.name}
                        />
                    </section>
                )}

                {next && (
                    <Link
                        href={next.href}
                        prefetch
                        className="group mt-20 flex items-center gap-5 border-t border-ink/10 pt-8 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand @xl:gap-8"
                    >
                        <SmartImage
                            src={next.image}
                            alt=""
                            className="aspect-4/3 w-28 shrink-0 rounded-2xl @xl:w-44"
                            imgClassName="object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none"
                        />
                        <span className="min-w-0 flex-1">
                            <span className="block text-xs tracking-[0.2em] text-ink/50 uppercase">
                                Next project
                            </span>
                            <span className="mt-2 block font-display text-[clamp(1.1rem,3cqi,2rem)] leading-tight text-ink transition-colors duration-300 group-hover:text-brand">
                                {next.name}
                            </span>
                        </span>
                        <span
                            aria-hidden="true"
                            className="grid size-11 shrink-0 place-items-center rounded-full bg-brand text-brand-foreground transition-transform duration-300 ease-out group-hover:translate-x-1 motion-reduce:transition-none"
                        >
                            <ArrowRight className="size-5" strokeWidth={1.75} />
                        </span>
                    </Link>
                )}
            </div>
        </>
    );
}
