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
            <div className="grid gap-10 max-md:gap-6 @3xl:grid-cols-5 @3xl:items-end @3xl:gap-10">
                <SmartImage
                    className="aspect-3/2 w-full min-w-0 rounded-3xl @3xl:col-span-3 @3xl:aspect-4/3"
                    imgClassName="object-cover"
                    src="/images/craftsman-workshop-woodworking-w1600.webp"
                    alt="Craftsman working a piece of wood on a sunlit workshop bench"
                />

                {/* nested container so the heading scales to THIS column, not the viewport */}
                <div className="@container min-w-0 @3xl:col-span-2">
                    <h2 className="font-display text-[clamp(1.75rem,8cqi,3.25rem)] leading-[1.15] text-ink">
                        {years} Years of Craftsmanship
                    </h2>

                    <p className="mt-4 max-w-xl font-sans text-base leading-relaxed font-semibold text-ink max-md:mt-3 max-md:text-[15px]">
                        More than two decades of transforming houses into homes
                        through exceptional craftsmanship, premium materials,
                        and personalized design.
                    </p>

                    <Link
                        href="/contact"
                        className="mt-8 inline-flex rounded-full border border-brand px-10 py-3 text-base font-medium text-brand transition-colors hover:bg-brand hover:text-brand-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand max-md:mt-5 max-md:w-full max-md:justify-center max-md:rounded-xl max-md:py-3 max-md:text-sm lg:pr-20"
                    >
                        Get in touch
                    </Link>
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
