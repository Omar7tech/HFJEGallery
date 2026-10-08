import { Link } from '@inertiajs/react';
import CountUp from '@/components/count-up';
import { SmartImage } from '@/components/smart-image';
import { yearsOfExperience } from '@/lib/experience';

interface Stat {
    count?: number;
    prefix?: string;
    text?: string;
    lines: [string, string];
}

function Experience() {
    const years = yearsOfExperience();

    const stats: Stat[] = [
        { prefix: '+', count: years, lines: ['Years', 'of Experience'] },
        { prefix: '+', count: 1000, lines: ['Completed', 'Projects'] },
        { text: 'Premium', lines: ['Materials', '& Fabrics'] },
        { text: 'Custom', lines: ['Furniture', '& Interiors'] },
    ];

    return (
        <section className="@container w-full px-5 py-16 font-display max-md:py-10 md:px-12 md:py-24 lg:pr-16 lg:pl-0">
            {/* Image + intro */}
            {/* From @3xl the intro sits inside the image, over a frosted right edge */}
            <div className="grid gap-10 max-md:gap-6 @3xl:grid-cols-5 @3xl:items-end @3xl:gap-10">
                {/* min-height matches the old 3-column 4:3 image, so the block is no taller */}
                <SmartImage
                    className="aspect-3/2 w-full min-w-0 rounded-3xl @3xl:col-span-full @3xl:col-start-1 @3xl:row-start-1 @3xl:aspect-auto @3xl:min-h-[calc(45cqi-0.75rem)] @3xl:self-stretch"
                    imgClassName="object-cover object-[36%_50%] @3xl:absolute @3xl:inset-0"
                    src="/images/craftsman-workshop-woodworking-w2400.webp"
                    alt="Craftsman working a piece of wood on a sunlit workshop bench"
                >
                    <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-y-0 right-0 hidden w-3/5 bg-cream/75 mask-[linear-gradient(to_right,transparent,black_38%)] backdrop-blur-xl @3xl:block"
                    />
                </SmartImage>

                <div className="relative min-w-0 @3xl:col-span-2 @3xl:col-start-4 @3xl:row-start-1 @3xl:py-8 @3xl:pr-8">
                    {/* nested container so the heading scales to THIS column, not the viewport */}
                    <div className="@container">
                        <h2 className="font-display text-[clamp(1.75rem,8cqi,3.25rem)] leading-[1.15] text-ink">
                            {years} Years of Craftsmanship
                        </h2>

                        <p className="mt-4 max-w-xl font-sans text-base leading-relaxed font-semibold text-ink max-md:mt-3 max-md:text-[15px]">
                            More than two decades of transforming houses into
                            homes through exceptional craftsmanship, premium
                            materials, and personalized design.
                        </p>

                        <Link
                            href="/contact"
                            className="mt-8 inline-flex rounded-full border border-brand px-10 py-3 text-base font-medium text-brand transition-colors hover:bg-brand hover:text-brand-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand max-md:mt-5 max-md:w-full max-md:justify-center max-md:rounded-xl max-md:py-3 max-md:text-sm lg:pr-20"
                        >
                            Get in touch
                        </Link>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-2 gap-x-8 gap-y-10 max-md:mt-8 max-md:gap-y-6 max-md:border-t max-md:border-ink/10 max-md:pt-6 md:mt-20 @2xl:grid-cols-4">
                {stats.map((stat) => (
                    <div key={stat.lines[0]} className="@container min-w-0">
                        <p className="font-display text-[clamp(1.5rem,15cqi,2.75rem)] leading-none text-ink">
                            {stat.text ?? (
                                <>
                                    {stat.prefix}
                                    <CountUp to={stat.count!} duration={2} />
                                </>
                            )}
                        </p>
                        <p className="mt-3 text-[clamp(0.9rem,6cqi,1.125rem)] leading-tight text-ink">
                            {stat.lines[0]}
                            <br />
                            {stat.lines[1]}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default Experience;
