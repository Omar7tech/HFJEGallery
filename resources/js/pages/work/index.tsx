import WorkCategoryCard from '@/components/work-category-card';
import type { WorkCategory } from '@/types';

/** The first row (two across from tablet up) fetches with the page. */
const EAGER_CARDS = 2;

export default function WorkIndex({
    categories,
}: {
    categories: WorkCategory[];
}) {
    return (
        <>
            <div className="@container px-5 pt-6 pb-20 max-md:pb-12 md:px-8 md:pb-24 lg:pt-10 lg:pr-7 lg:pl-0">
                <header className="flex flex-col gap-5 max-md:gap-3 @3xl:flex-row @3xl:items-end @3xl:justify-between">
                    <h1 className="font-display text-[clamp(2.25rem,8cqi,4.75rem)] leading-[1.05] text-ink">
                        Our Work
                    </h1>
                    <p className="max-w-md font-sans text-base leading-relaxed text-brand max-md:text-[15px] @3xl:text-right">
                        Every project is unique because every family lives
                        differently. Choose a kind of space to explore the homes
                        and places we have crafted.
                    </p>
                </header>

                {categories.length > 0 ? (
                    <div className="mt-8 grid gap-4 max-md:mt-6 max-md:gap-3 sm:grid-cols-2 xl:gap-5">
                        {categories.map((category, index) => (
                            <WorkCategoryCard
                                key={category.slug}
                                category={category}
                                eager={index < EAGER_CARDS}
                            />
                        ))}
                    </div>
                ) : (
                    <p className="mt-10 rounded-3xl bg-surface px-6 py-16 text-center font-sans text-base text-ink/60">
                        Our portfolio is being photographed. Check back soon.
                    </p>
                )}
            </div>
        </>
    );
}
