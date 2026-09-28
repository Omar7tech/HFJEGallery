import CurtainStyleCard from '@/components/curtain-style-card';
import PageHeader from '@/components/page-header';
import type { CurtainStyle } from '@/types';

/** The first row (four across on desktop) fetches with the page. */
const EAGER_CARDS = 4;

/** Every active curtain style, as simple cards on one page. */
export default function CurtainStyles({ styles }: { styles: CurtainStyle[] }) {
    return (
        <>
            <div className="@container px-5 pt-6 pb-20 max-md:pt-4 max-md:pb-12 md:px-8 md:pb-24 lg:pt-10 lg:pr-7 lg:pl-0">
                <PageHeader
                    back={{ label: 'Curtains', href: '/curtains' }}
                    title="Designed for Every Window"
                    lead="From soft sheers to complete light control."
                />

                {styles.length > 0 ? (
                    <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 max-md:mt-6 max-md:gap-x-3 max-md:gap-y-6 @3xl:grid-cols-3 @3xl:gap-x-5 @5xl:grid-cols-4">
                        {styles.map((style, index) => (
                            <CurtainStyleCard
                                key={style.slug}
                                style={style}
                                eager={index < EAGER_CARDS}
                            />
                        ))}
                    </div>
                ) : (
                    <p className="mt-10 rounded-3xl bg-surface px-6 py-16 text-center font-sans text-base text-ink/60">
                        Curtain styles are coming soon.
                    </p>
                )}
            </div>
        </>
    );
}
