import { Head } from '@inertiajs/react';

/** Placeholder figures. Swap these for the real studio numbers. */
const figures: { value: string; label: string }[] = [
    { value: '1998', label: 'Founded in Beirut' },
    { value: '400+', label: 'Homes furnished' },
    { value: '12', label: 'Craftspeople in studio' },
];

/** Placeholder pillars. Swap these for the real positioning copy. */
const pillars: { title: string; body: string }[] = [
    {
        title: 'Made to measure',
        body: 'Every curtain, blind and upholstery piece is cut for the room it will live in, not for a catalogue.',
    },
    {
        title: 'Material first',
        body: 'We start from the cloth — its weight, its fall, the way it takes light through the day.',
    },
    {
        title: 'Built to stay',
        body: 'Finishes and fittings chosen so a room still reads well a decade after we hand it over.',
    },
];

export default function About() {
    return (
        <>
            <Head title="About" />

            <section className="@container w-full px-6 py-16 font-display md:px-12 md:py-24 lg:pr-16 lg:pl-0">
                <h1 className="max-w-4xl text-[clamp(2rem,9cqi,4rem)] leading-[1.1] text-ink">
                    Crafted around living.
                </h1>

                <p className="mt-6 max-w-xl font-sans text-base leading-relaxed text-ink/75 @lg:text-lg">
                    Home Fashion Jamaleddine is a family studio working between
                    fabric, furniture and the rooms they belong to. Placeholder
                    copy — replace before launch.
                </p>

                <dl className="mt-14 grid gap-10 border-t border-ink/15 pt-12 @2xl:grid-cols-3">
                    {figures.map((figure) => (
                        <div key={figure.label} className="min-w-0">
                            <dt className="sr-only">{figure.label}</dt>
                            <dd className="text-[clamp(2rem,5cqi,3rem)] leading-none text-brand">
                                {figure.value}
                            </dd>
                            <p className="mt-3 font-sans text-sm leading-relaxed text-ink/70">
                                {figure.label}
                            </p>
                        </div>
                    ))}
                </dl>

                <div className="mt-16 grid gap-12 border-t border-ink/15 pt-12 @3xl:grid-cols-3 @3xl:gap-10">
                    {pillars.map((pillar) => (
                        <article key={pillar.title} className="min-w-0">
                            <h2 className="text-2xl leading-tight text-ink">
                                {pillar.title}
                            </h2>
                            <p className="mt-3 font-sans text-base leading-relaxed text-ink/75">
                                {pillar.body}
                            </p>
                        </article>
                    ))}
                </div>
            </section>
        </>
    );
}
