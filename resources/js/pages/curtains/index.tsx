import { Head, Link } from '@inertiajs/react';
import { useRef, useState } from 'react';
import CurtainStyleCard from '@/components/curtain-style-card';
import { SmartImage } from '@/components/smart-image';
import { cn } from '@/lib/utils';
import type { CurtainStyle, ProjectCard } from '@/types';

/** From this many styles on, the section becomes the hover gallery. */
const GALLERY_FROM = 5;

/** Card columns on desktop for one to four styles, so they fill the row. */
const STYLE_COLUMNS: Record<number, string> = {
    1: '@lg:grid-cols-2',
    2: '@lg:grid-cols-2',
    3: '@lg:grid-cols-3',
    4: '@lg:grid-cols-4',
};

const pill =
    'inline-flex min-h-11 items-center justify-center rounded-full bg-brand px-10 py-3.5 font-display text-[clamp(0.8rem,2.05cqi,1.25rem)] leading-tight text-white transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand';

interface CurtainsProps {
    styles: CurtainStyle[];
    /** The first few curtain works, in dashboard order. */
    works: ProjectCard[];
    /** How many curtain works there are in all. */
    worksCount: number;
}

export default function Curtains({ styles, works, worksCount }: CurtainsProps) {
    const heroVideo = useRef<HTMLVideoElement>(null);
    const [heroReady, setHeroReady] = useState(false);
    const [activeStyle, setActiveStyle] = useState(0);
    /** Two full rows fit one desktop screen; a single row keeps its natural
     * tile shape instead. */
    const fitsScreen = works.length > 4;

    return (
        <>
            <Head title="Curtains & Textiles">
                {/* The film is the hero on its own, so start fetching it with
                    the page instead of waiting on the video element. */}
                <link
                    key="curtain-film-preload"
                    rel="preload"
                    as="video"
                    type="video/mp4"
                    href="/videos/curtains/curtain-film.mp4"
                />
            </Head>
            <div className="@container px-5 pt-6 pb-24 md:px-8 lg:pr-7 lg:pl-0 @lg:pb-[50cqi]">
                <section aria-label="Curtains and textiles">
                    {/* Fills the screen inside the page gutters: one viewport
                        less the fixed brand bar, the top padding and the same
                        gap again underneath, so the film sits inset on all
                        four sides. Capped so it stops growing on a large
                        display. */}
                    <div className="relative h-[calc(100svh-7rem-max(0.75rem,env(safe-area-inset-top)))] max-h-230 overflow-hidden rounded-3xl bg-cream md:rounded-[36px] lg:h-[calc(100svh-3rem)]">
                        {/* No poster: the photo is framed differently from
                            the film, so showing it first jumped on the swap.
                            The film fades up from the empty box once it has a
                            frame to show. */}
                        <video
                            ref={heroVideo}
                            className={cn(
                                'size-full object-cover transition-opacity duration-500 ease-out motion-reduce:transition-none',
                                heroReady ? 'opacity-100' : 'opacity-0',
                            )}
                            src="/videos/curtains/curtain-film.mp4"
                            autoPlay
                            muted
                            loop
                            playsInline
                            preload="auto"
                            onLoadedData={() => {
                                // Anyone who asked for less motion holds on
                                // the first frame instead of the loop.
                                if (
                                    window.matchMedia(
                                        '(prefers-reduced-motion: reduce)',
                                    ).matches
                                ) {
                                    heroVideo.current?.pause();
                                }

                                setHeroReady(true);
                            }}
                            aria-label="Curtains moving in natural light"
                        />
                        {/* Title laid over the upper third of the film; the two
                            lines share a right edge, as in the design. */}
                        <div className="pointer-events-none absolute inset-x-0 top-[22%] flex justify-center px-6">
                            <h1 className="text-right font-display text-[clamp(2rem,7.5cqi,6rem)] leading-[1.05] tracking-[-0.02em] text-white uppercase [text-shadow:0_2px_24px_rgba(26,22,20,0.25)]">
                                Curtains
                                <br />
                                &amp;Textiles
                            </h1>
                        </div>
                    </div>
                </section>

                <section
                    id="curtains-portfolio"
                    className={cn(
                        'scroll-mt-24 px-1 pt-24 @lg:px-8 @lg:pt-[18cqi]',
                        fitsScreen &&
                            'lg:mt-[8cqi] lg:flex lg:h-dvh lg:max-h-[1000px] lg:min-h-[640px] lg:scroll-mt-0 lg:flex-col lg:py-10!',
                    )}
                >
                    <div className="flex flex-col justify-between gap-6 @lg:flex-row @lg:items-start">
                        <h2 className="font-display text-[clamp(1.5rem,3.8cqi,2.6rem)] leading-[1.2] tracking-[-0.045em] text-brand">
                            Shaping Light.
                            <br />
                            Completing
                            <br />
                            Spaces.
                        </h2>
                        {/* Desktop keeps a fixed three-line shape against the
                            heading, so the breaks are set rather than wrapped. */}
                        <p className="max-w-[290px] font-sans text-base leading-relaxed @lg:w-auto @lg:max-w-[52ch] @lg:text-right">
                            Curtains define more than privacy. They shape the{' '}
                            <br className="hidden @lg:inline" />
                            light, soften the architecture, and complete the{' '}
                            <br className="hidden @lg:inline" />
                            atmosphere of a room.
                        </p>
                    </div>
                    {works.length > 0 && (
                        <>
                            <div
                                className={cn(
                                    'mt-10 flex flex-wrap items-center justify-between gap-3 @lg:mt-12',
                                    fitsScreen && 'lg:mt-6!',
                                )}
                            >
                                <h3 className="font-sans text-sm uppercase @lg:text-lg">
                                    Our curtains work{' '}
                                    <sup className="text-[10px]">
                                        ({worksCount})
                                    </sup>
                                </h3>
                                <ul className="flex gap-3 font-sans text-base text-ink @lg:gap-8 @lg:text-lg">
                                    {['Complete', 'Tailored', 'Layered'].map(
                                        (item) => (
                                            <li key={item} className="px-1">
                                                {item}
                                            </li>
                                        ),
                                    )}
                                </ul>
                            </div>
                            <div
                                className={cn(
                                    'mt-4 grid grid-cols-2 gap-1 @lg:grid-cols-4',
                                    fitsScreen &&
                                        'lg:min-h-0 lg:flex-[1_1_0] lg:auto-rows-[minmax(0,1fr)] lg:grid-cols-4',
                                )}
                            >
                                {works.map((work) => (
                                    <Link
                                        key={work.slug}
                                        href={`/curtains/work/${work.slug}`}
                                        prefetch
                                        className={cn(
                                            'group block aspect-[1.25] overflow-hidden bg-cream focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand',
                                            fitsScreen && 'lg:aspect-auto',
                                        )}
                                    >
                                        <SmartImage
                                            src={work.image}
                                            alt={work.name}
                                            className="size-full"
                                            imgClassName="object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                                        />
                                    </Link>
                                ))}
                            </div>
                            <div
                                className={cn(
                                    'mt-10 text-center',
                                    fitsScreen && 'lg:mt-6',
                                )}
                            >
                                <Link
                                    href="/curtains/work"
                                    prefetch
                                    className={cn(pill, 'min-w-[34%]')}
                                >
                                    View More
                                </Link>
                            </div>
                        </>
                    )}
                </section>

                {styles.length > 0 && (
                    <section
                        id="curtain-styles"
                        className="scroll-mt-24 px-1 pt-24 @lg:pt-[18cqi]"
                    >
                        <h2 className="font-display text-[clamp(1.25rem,3.5cqi,2.5rem)] leading-tight tracking-[-0.04em] uppercase">
                            Designed for Every Window
                        </h2>
                        <p className="mt-2 font-display text-[clamp(0.75rem,2.15cqi,1.4rem)]">
                            From Soft Sheers To Complete Light Control.
                        </p>

                        {/* A few styles sit side by side as cards; five or
                            more fold into the hover gallery instead. */}
                        {styles.length < GALLERY_FROM ? (
                            <div
                                className={cn(
                                    'mt-5 grid grid-cols-2 gap-x-4 gap-y-10 @lg:gap-x-5',
                                    STYLE_COLUMNS[styles.length],
                                )}
                            >
                                {styles.map((style) => (
                                    <CurtainStyleCard
                                        key={style.slug}
                                        style={style}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="curtain-style-gallery mt-5 flex h-[360px] gap-2 @lg:h-[min(46cqi,620px)] @lg:gap-2.5">
                                {styles.map((style, index) => (
                                    <button
                                        key={style.slug}
                                        type="button"
                                        aria-label={style.name}
                                        aria-pressed={activeStyle === index}
                                        onClick={() => setActiveStyle(index)}
                                        onPointerEnter={(event) => {
                                            if (event.pointerType === 'mouse') {
                                                setActiveStyle(index);
                                            }
                                        }}
                                        onFocus={() => setActiveStyle(index)}
                                        className={cn(
                                            'curtain-style-card relative min-w-0 overflow-hidden bg-cream text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
                                            activeStyle === index
                                                ? 'flex-[6.5]'
                                                : 'flex-1',
                                        )}
                                    >
                                        <SmartImage
                                            src={style.image}
                                            alt={style.description}
                                            className="size-full"
                                            imgClassName="object-cover"
                                        />
                                        <span
                                            aria-hidden="true"
                                            className="curtain-style-label absolute bottom-5 px-4 py-3 font-display text-[clamp(0.55rem,1.45cqi,1rem)] leading-tight whitespace-nowrap text-white uppercase"
                                        >
                                            <span className="curtain-style-label-text relative">
                                                {style.name}
                                            </span>
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="mt-5 text-center">
                            <Link
                                href="/curtains/styles"
                                prefetch
                                className={cn(
                                    pill,
                                    'min-w-[56%] text-[clamp(0.7rem,1.7cqi,1.15rem)] uppercase',
                                )}
                            >
                                Explore All Curtain Styles
                            </Link>
                        </div>
                    </section>
                )}
            </div>
        </>
    );
}
