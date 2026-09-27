import { Head } from '@inertiajs/react';
import WorkCategoryCard from '@/components/work-category-card';
import type { WorkCategory } from '@/types';

/** Cards in the first row fetch with the page; the rest wait for the scroll. */
const EAGER_CARDS = 2;

export default function WorkIndex({
    categories,
}: {
    categories: WorkCategory[];
}) {
    return (
        <>
            <Head title="Work">
                <meta
                    name="description"
                    content="Homes, apartments, restaurants and commercial spaces crafted by HFJE around the people who use them."
                />
            </Head>

            <div className="@container px-5 pt-6 pb-20 md:px-8 md:pb-24 lg:pt-10 lg:pr-7 lg:pl-0">
                <header className="flex flex-col gap-5 @3xl:flex-row @3xl:items-end @3xl:justify-between">
                    <h1 className="font-display text-[clamp(2.25rem,8cqi,4.75rem)] leading-[1.05] text-ink">
                        Our Work
                    </h1>
                    <p className="max-w-md font-sans text-base leading-relaxed text-brand @3xl:text-right">
                        Every project is unique because every family lives
                        differently. Choose a kind of space to explore the homes
                        and places we have crafted.
                    </p>
                </header>

                {categories.length > 0 ? (
                    <div className="mt-10 grid gap-4 @xl:grid-cols-2 @2xl:gap-5 @6xl:grid-cols-4">
                        {categories.map((category, index) => (
                            <WorkCategoryCard
                                key={category.slug}
                                category={category}
                                eager={index < EAGER_CARDS}
                            />
                        ))}
                    </div>
                ) : (
                    <p className="mt-10 rounded-3xl bg-[#f2f1ef] px-6 py-16 text-center font-sans text-base text-ink/60">
                        Our portfolio is being photographed. Check back soon.
                    </p>
                )}
            </div>
        </>
    );
}
