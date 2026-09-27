import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import CurtainStyleCard from '@/components/curtain-style-card';
import type { CurtainStyle } from '@/types';

/** The first row (four across on desktop) fetches with the page. */
const EAGER_CARDS = 4;

/** Every active curtain style, as simple cards on one page. */
export default function CurtainStyles({ styles }: { styles: CurtainStyle[] }) {
    return (
        <>
            <Head title="Curtain Styles">
                <meta
                    name="description"
                    content="Every curtain style HFJE makes, from soft sheers to complete light control."
                />
            </Head>

            <div className="@container px-5 pt-6 pb-20 md:px-8 md:pb-24 lg:pt-10 lg:pr-7 lg:pl-0">
                <Link
                    href="/curtains"
                    className="inline-flex min-h-11 items-center gap-2 font-sans text-sm text-ink/60 transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                    <ArrowLeft className="size-4" strokeWidth={1.75} />
                    Curtains
                </Link>

                <h1 className="mt-4 font-display text-[clamp(1.75rem,5cqi,3.5rem)] leading-[1.1] tracking-[-0.04em] text-ink uppercase">
                    Designed for Every Window
                </h1>
                <p className="mt-3 max-w-xl font-sans text-base leading-relaxed text-ink/70">
                    From soft sheers to complete light control.
                </p>

                {styles.length > 0 ? (
                    <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 @3xl:grid-cols-3 @3xl:gap-x-5 @5xl:grid-cols-4">
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
