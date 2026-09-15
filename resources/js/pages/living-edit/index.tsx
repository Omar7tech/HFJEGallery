import { Head } from '@inertiajs/react';

/** Placeholder entries. Swap these for real editorial content. */
const entries: { title: string; blurb: string; tag: string }[] = [
    {
        tag: 'Materials',
        title: 'Linen, in three weights',
        blurb: 'How weave density changes the way a room holds light.',
    },
    {
        tag: 'Rooms',
        title: 'The quiet living room',
        blurb: 'Layering texture when the palette stays almost still.',
    },
    {
        tag: 'Craft',
        title: 'Behind the curtain wall',
        blurb: 'Notes from the workshop on drape, fall and finish.',
    },
];

export default function LivingEdit() {
    return (
        <>
            <Head title="Living Edit" />

            <section className="@container w-full px-6 py-16 font-display md:px-12 md:py-24 lg:pr-16 lg:pl-0">
                <h1 className="max-w-4xl text-[clamp(2rem,9cqi,4rem)] leading-[1.1] text-ink">
                    Living Edit.
                </h1>

                <p className="mt-6 max-w-xl font-sans text-base leading-relaxed text-ink/75 @lg:text-lg">
                    Notes on materials, rooms and the craft behind them. A slow
                    read from the studio.
                </p>

                <div className="mt-14 grid gap-12 border-t border-ink/15 pt-12 @3xl:grid-cols-3 @3xl:gap-10">
                    {entries.map((entry) => (
                        <article key={entry.title} className="min-w-0">
                            <p className="font-sans text-xs tracking-[0.2em] text-brand uppercase">
                                {entry.tag}
                            </p>
                            <h2 className="mt-3 text-2xl leading-tight text-ink">
                                {entry.title}
                            </h2>
                            <p className="mt-3 font-sans text-base leading-relaxed text-ink/75">
                                {entry.blurb}
                            </p>
                        </article>
                    ))}
                </div>
            </section>
        </>
    );
}
