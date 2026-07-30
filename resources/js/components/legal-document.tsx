import { Head } from '@inertiajs/react';

/** A paragraph, or a bulleted list of points, inside a section. */
export type LegalBlock =
    { type: 'text'; text: string } | { type: 'list'; items: string[] };

export type LegalSection = {
    /** Anchor target — also what the contents list links to. */
    id: string;
    title: string;
    blocks: LegalBlock[];
};

type LegalDocumentProps = {
    title: string;
    intro: string;
    sections: LegalSection[];
};

function SectionBlock({ block }: { block: LegalBlock }) {
    if (block.type === 'list') {
        return (
            <ul className="flex flex-col gap-2.5 pl-0">
                {block.items.map((item) => (
                    <li
                        key={item}
                        className="relative pl-6 text-base leading-relaxed text-ink/75 before:absolute before:top-[0.7em] before:left-0 before:h-px before:w-3 before:bg-brand/60"
                    >
                        {item}
                    </li>
                ))}
            </ul>
        );
    }

    return (
        <p className="text-base leading-relaxed text-ink/75">{block.text}</p>
    );
}

/**
 * Shared shell for the legal pages (privacy, terms). Numbered sections in a
 * single readable column, with a contents list that pins alongside them on
 * wide screens and sits above the text on small ones.
 */
export default function LegalDocument({
    title,
    intro,
    sections,
}: LegalDocumentProps) {
    return (
        <>
            <Head title={title} />

            <section className="@container w-full px-6 py-16 font-display md:px-12 md:py-24 lg:pr-16 lg:pl-0">
                <p className="font-sans text-xs font-semibold tracking-[0.25em] text-brand uppercase">
                    Legal
                </p>

                <h1 className="mt-5 max-w-4xl text-[clamp(2rem,9cqi,4rem)] leading-[1.1] text-ink">
                    {title}
                </h1>

                <p className="mt-6 max-w-xl font-sans text-base leading-relaxed text-ink/75 @lg:text-lg">
                    {intro}
                </p>

                {/* One rule across the top ties the contents list and the
                    document body together instead of boxing each of them. */}
                <div className="mt-14 grid gap-12 border-t border-ink/15 pt-12 @3xl:grid-cols-12 @3xl:gap-16">
                    {/* Contents — first in the DOM so it reads as a summary on
                        small screens; pinned to the right column on wide ones. */}
                    <nav
                        aria-label="Contents"
                        className="min-w-0 self-start @3xl:sticky @3xl:top-10 @3xl:col-span-4 @3xl:col-start-9 @3xl:row-start-1"
                    >
                        <h2 className="text-sm tracking-[0.2em] text-ink/70 uppercase">
                            Contents
                        </h2>
                        <ol className="mt-4 flex flex-col gap-2.5 font-sans">
                            {sections.map((section, index) => (
                                <li key={section.id}>
                                    <a
                                        href={`#${section.id}`}
                                        className="flex gap-3 text-sm leading-relaxed text-ink/70 transition-colors duration-200 ease-out hover:text-brand-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand motion-reduce:transition-none"
                                    >
                                        <span className="text-ink/40 tabular-nums">
                                            {String(index + 1).padStart(2, '0')}
                                        </span>
                                        {section.title}
                                    </a>
                                </li>
                            ))}
                        </ol>
                    </nav>

                    <div className="min-w-0 font-sans @3xl:col-span-7 @3xl:row-start-1">
                        <div className="flex flex-col gap-12">
                            {sections.map((section, index) => (
                                <article
                                    key={section.id}
                                    id={section.id}
                                    className="scroll-mt-28 lg:scroll-mt-16"
                                >
                                    <h2 className="flex gap-4 font-display text-lg leading-snug text-ink @lg:text-xl">
                                        <span
                                            aria-hidden
                                            className="text-brand tabular-nums"
                                        >
                                            {String(index + 1).padStart(2, '0')}
                                        </span>
                                        {section.title}
                                    </h2>

                                    <div className="mt-4 flex max-w-2xl flex-col gap-4">
                                        {section.blocks.map(
                                            (block, blockIndex) => (
                                                <SectionBlock
                                                    key={blockIndex}
                                                    block={block}
                                                />
                                            ),
                                        )}
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
