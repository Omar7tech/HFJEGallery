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
        <section className="@container/experience w-full px-5 py-16 font-display max-md:py-10 md:px-12 md:py-24 lg:pr-16 lg:pl-0">
            {/* Image + intro — the intro sits inside the image, over a frosted edge:
                bottom of the portrait image below @3xl, right of the wide one above */}
            <div className="grid gap-4 @3xl:grid-cols-5 @3xl:items-end @3xl:gap-10">
                <SmartImage
                    className="col-start-1 row-start-1 aspect-4/5 w-full min-w-0 rounded-3xl @3xl:hidden"
                    imgClassName="object-cover"
                    src="/images/craftsman-workshop-woodworking-portrait-w1200.webp"
                    alt="Craftsman working a piece of wood on a sunlit workshop bench"
                >
                    <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-x-0 bottom-0 h-[68%] bg-linear-to-b from-cream/0 via-cream/28 via-55% to-cream/42 mask-[linear-gradient(to_bottom,transparent,rgb(0_0_0/0.08)_12%,rgb(0_0_0/0.3)_26%,rgb(0_0_0/0.65)_40%,black_56%)] backdrop-blur-2xl"
                    />
                </SmartImage>

                {/* min-height matches the old 3-column 4:3 image, so the block is no taller */}
                <SmartImage
                    className="hidden w-full min-w-0 rounded-3xl @3xl:col-span-full @3xl:col-start-1 @3xl:row-start-1 @3xl:block @3xl:min-h-[calc(45cqi-0.75rem)] @3xl:self-stretch"
                    imgClassName="absolute inset-0 object-cover"
                    src="/images/craftsman-workshop-woodworking-w2400.webp"
                    alt="Craftsman working a piece of wood on a sunlit workshop bench"
                >
                    <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-y-0 right-0 w-[70%] bg-linear-to-r from-cream/0 via-cream/28 via-55% to-cream/42 mask-[linear-gradient(to_right,transparent,rgb(0_0_0/0.08)_12%,rgb(0_0_0/0.3)_26%,rgb(0_0_0/0.65)_40%,black_56%)] backdrop-blur-2xl"
                    />
                </SmartImage>

                {/* below @3xl this wrapper dissolves: the copy overlays the image, the button drops under it */}
                <div className="contents @3xl:relative @3xl:col-span-2 @3xl:col-start-4 @3xl:row-start-1 @3xl:block @3xl:min-w-0 @3xl:py-8 @3xl:pr-8 @3xl:text-right">
                    {/* nested container so the heading scales to THIS column, not the viewport */}
                    <div className="@container relative col-start-1 row-start-1 min-w-0 self-end p-5 @3xl/experience:p-0">
                        <h2 className="font-display text-[clamp(1.6rem,8.5cqi,2rem)] leading-[1.15] text-ink @3xl/experience:text-[clamp(1.75rem,8cqi,3.25rem)]">
                            {years} Years of Craftsmanship
                        </h2>

                        <p className="mt-2 max-w-[17rem] font-sans text-sm leading-snug font-semibold text-ink @3xl/experience:mt-4 @3xl/experience:ml-auto @3xl/experience:max-w-xl @3xl/experience:text-base @3xl/experience:leading-relaxed">
                            More than two decades of transforming houses into
                            homes through exceptional craftsmanship, premium
                            materials, and personalized design.
                        </p>
                    </div>

                    <Link
                        href="/contact"
                        className="inline-flex justify-self-start rounded-full border border-brand px-10 py-3 text-base font-medium text-brand transition-colors hover:bg-brand hover:text-brand-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand max-md:w-full max-md:justify-center max-md:rounded-xl max-md:py-3 max-md:text-sm @3xl/experience:mt-8 @3xl/experience:border-white @3xl/experience:bg-white @3xl/experience:hover:border-brand @3xl/experience:hover:bg-brand"
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
