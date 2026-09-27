import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import ProjectGallery from '@/components/project-gallery';
import { SmartImage } from '@/components/smart-image';
import type { ProjectDetail, WorkCategoryLink } from '@/types';

interface WorkProjectProps {
    category: WorkCategoryLink;
    project: ProjectDetail;
    nextProject: { slug: string; name: string; image: string } | null;
}

export default function WorkProject({
    category,
    project,
    nextProject,
}: WorkProjectProps) {
    const facts = [
        { label: 'Category', value: category.name },
        { label: 'Location', value: project.location },
        { label: 'Year', value: project.year?.toString() },
    ].filter((fact): fact is { label: string; value: string } =>
        Boolean(fact.value),
    );

    // Paragraphs are separated by an empty line in the dashboard.
    const paragraphs = (project.description ?? '')
        .split(/\n\s*\n/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean);

    return (
        <>
            <Head title={`${project.name} · ${category.name}`}>
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
                    href={`/work/${category.slug}`}
                    className="inline-flex items-center gap-2 text-sm tracking-[0.15em] text-ink/60 uppercase transition-colors hover:text-brand"
                >
                    <ArrowLeft className="size-4" strokeWidth={1.75} />
                    {category.name}
                </Link>

                <h1 className="mt-5 max-w-5xl font-display text-[clamp(2rem,7cqi,4.5rem)] leading-[1.05] text-ink">
                    {project.name}
                </h1>

                {/* The cover is the LCP image: fetched eagerly at high priority. */}
                <SmartImage
                    src={project.cover}
                    alt={project.name}
                    loading="eager"
                    fetchPriority="high"
                    className="mt-8 h-[56svh] max-h-190 min-h-72 rounded-3xl md:rounded-[36px] lg:h-[72svh]"
                    imgClassName="object-cover"
                />

                {/* The story, kept compact: the facts as one slim strip,
                    the summary as a lead line, then the paragraphs flowing
                    in balanced columns so long text never leaves gaps. */}
                {(facts.length > 0 ||
                    project.summary ||
                    paragraphs.length > 0) && (
                    <section aria-label="About the project" className="mt-10">
                        {facts.length > 0 && (
                            <dl className="flex flex-wrap divide-x divide-ink/10 rounded-2xl bg-[#f2f1ef] py-4">
                                {facts.map((fact) => (
                                    <div
                                        key={fact.label}
                                        className="px-5 md:px-7"
                                    >
                                        <dt className="text-[11px] tracking-[0.2em] text-ink/50 uppercase">
                                            {fact.label}
                                        </dt>
                                        <dd className="mt-1 font-sans text-base text-ink">
                                            {fact.value}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        )}

                        {project.summary && (
                            <p className="mt-8 max-w-4xl font-sans text-[clamp(1.2rem,2.2cqi,1.6rem)] leading-snug font-medium text-ink">
                                {project.summary}
                            </p>
                        )}

                        {paragraphs.length > 0 && (
                            <div className="mt-5 gap-10 @3xl:columns-2">
                                {paragraphs.map((paragraph) => (
                                    <p
                                        key={paragraph}
                                        className="mb-4 font-sans text-base leading-relaxed whitespace-pre-line text-ink/70 last:mb-0"
                                    >
                                        {paragraph}
                                    </p>
                                ))}
                            </div>
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

                {nextProject && (
                    <Link
                        href={`/work/${category.slug}/${nextProject.slug}`}
                        prefetch
                        className="group mt-20 flex items-center gap-5 border-t border-ink/10 pt-8 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand @xl:gap-8"
                    >
                        <SmartImage
                            src={nextProject.image}
                            alt=""
                            className="aspect-4/3 w-28 shrink-0 rounded-2xl @xl:w-44"
                            imgClassName="object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none"
                        />
                        <span className="min-w-0 flex-1">
                            <span className="block text-xs tracking-[0.2em] text-ink/50 uppercase">
                                Next project
                            </span>
                            <span className="mt-2 block font-display text-[clamp(1.1rem,3cqi,2rem)] leading-tight text-ink transition-colors duration-300 group-hover:text-brand">
                                {nextProject.name}
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
