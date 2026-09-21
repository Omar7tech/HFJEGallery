import { Head } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { SmartImage } from '@/components/smart-image';
import { cn } from '@/lib/utils';

type CurtainImageProps = {
    name: string;
    alt: string;
    className?: string;
    eager?: boolean;
};

/** A curtain photo filling its parent box, through the shared image loader. */
function CurtainImage({
    name,
    alt,
    className,
    eager = false,
}: CurtainImageProps) {
    return (
        <SmartImage
            src={`/images/curtains/${name}.webp`}
            alt={alt}
            className={cn('size-full', className)}
            imgClassName="object-cover"
            loading={eager ? 'eager' : 'lazy'}
            fetchPriority={eager ? 'high' : undefined}
        />
    );
}

const styles = [
    {
        name: 'Sheer curtains',
        image: 'layered-curtains',
        description: 'Soft daylight, filtered through sheer fabric.',
    },
    {
        name: 'Blackout curtains',
        image: 'blackout-curtains',
        description: 'Privacy and complete light control.',
    },
    {
        name: 'Eyelet curtains',
        image: 'eyelet-curtains',
        description: 'Clean folds with a contemporary finish.',
    },
    {
        name: 'Layered curtains',
        image: 'sheer-curtains',
        description: 'Sheer and heavier fabrics, working together.',
    },
    {
        name: 'Pleated curtains',
        image: 'pleated-curtains',
        description: 'Tailored pleats and a structured drape.',
    },
    {
        name: 'Decorative fabrics',
        image: 'curtain-fabrics',
        description: 'Texture and warmth for the finishing layer.',
    },
];
const portfolio = [
    ...Array.from({ length: 8 }, (_, index) => ({
        image: 'curtain-portfolio',
        alt: 'Sculptural vase framed by sheer and textured curtains',
        type: index % 2 ? 'Layered' : 'Tailored',
    })),
    {
        image: 'layered-curtains',
        alt: 'Layered curtains in a contemporary bedroom',
        type: 'Layered',
    },
    {
        image: 'blackout-curtains',
        alt: 'Dark blackout curtains beside a sunlit window',
        type: 'Layered',
    },
    {
        image: 'pleated-curtains',
        alt: 'Tailored pink curtain pleats',
        type: 'Tailored',
    },
    {
        image: 'eyelet-curtains',
        alt: 'Gray eyelet curtains on a decorative rail',
        type: 'Tailored',
    },
];
const pill =
    'inline-flex min-h-11 items-center justify-center rounded-full bg-[#ad6844] px-7 py-2 font-display text-[clamp(0.7rem,1.8cqi,1.1rem)] leading-tight text-white transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand';

export default function Curtains() {
    const heroVideo = useRef<HTMLVideoElement>(null);
    const [filter, setFilter] = useState('Complete');
    const [expanded, setExpanded] = useState(false);
    const [activeStyle, setActiveStyle] = useState(0);
    const [allStyles, setAllStyles] = useState(false);
    const filtered = portfolio.filter(
        (item) => filter === 'Complete' || item.type === filter,
    );

    // The hero film loops on its own, so hold it on the poster frame for
    // anyone who asked for less motion.
    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            heroVideo.current?.pause();
        }
    }, []);

    return (
        <>
            <Head title="Curtains & Textiles" />
            <div className="@container px-5 pt-6 pb-24 md:px-8 lg:pr-7 lg:pl-0 @lg:pb-[50cqi]">
                <section aria-label="Curtains and textiles">
                    {/* The film carries the hero; the heading stays for
                        screen readers and search. */}
                    <h1 className="sr-only">Curtains &amp; Textiles</h1>
                    <div className="relative aspect-[1.52] overflow-hidden rounded-[24px] bg-cream md:rounded-[36px]">
                        <video
                            ref={heroVideo}
                            className="size-full object-cover"
                            src="/videos/curtains/curtain-film.mp4"
                            poster="/images/curtains/curtain-hero.webp"
                            autoPlay
                            muted
                            loop
                            playsInline
                            preload="auto"
                            aria-label="Curtains moving in natural light"
                        />
                    </div>
                    <div className="mt-8 flex flex-wrap justify-center gap-4 @lg:gap-6">
                        <a
                            href="#curtains-portfolio"
                            className={cn(pill, 'min-w-[44%]')}
                        >
                            Curtains Portfolio
                        </a>
                        <a
                            href="#curtain-styles"
                            className={cn(pill, 'min-w-[36%]')}
                        >
                            Curtains Style
                        </a>
                    </div>
                </section>

                <section
                    id="curtains-portfolio"
                    className="scroll-mt-24 px-1 pt-24 @lg:px-8 @lg:pt-[18cqi]"
                >
                    <div className="flex flex-col justify-between gap-6 @lg:flex-row @lg:items-start">
                        <h2 className="font-display text-[clamp(1.5rem,3.8cqi,2.6rem)] leading-[1.2] tracking-[-0.045em] text-[#ad6844]">
                            Shaping Light.
                            <br />
                            Completing
                            <br />
                            Spaces.
                        </h2>
                        {/* Desktop keeps a fixed three-line shape against the
                            heading, so the breaks are set rather than wrapped. */}
                        <p className="max-w-[290px] font-display text-[clamp(0.6rem,1.15cqi,0.8rem)] leading-[1.6] @lg:w-auto @lg:max-w-[52ch] @lg:text-right">
                            Curtains define more than privacy. They shape the{' '}
                            <br className="hidden @lg:inline" />
                            light, soften the architecture, and complete the{' '}
                            <br className="hidden @lg:inline" />
                            atmosphere of a room.
                        </p>
                    </div>
                    <div className="mt-10 flex flex-wrap items-center justify-between gap-3 @lg:mt-12">
                        <h3 className="font-sans text-sm uppercase @lg:text-lg">
                            Our curtains work{' '}
                            <sup className="text-[10px]">
                                {portfolio.length}
                            </sup>
                        </h3>
                        <div
                            className="flex gap-3 @lg:gap-8"
                            aria-label="Filter curtain portfolio"
                        >
                            {['Complete', 'Tailored', 'Layered'].map((item) => (
                                <button
                                    key={item}
                                    type="button"
                                    aria-pressed={filter === item}
                                    onClick={() => {
                                        setFilter(item);
                                        setExpanded(false);
                                    }}
                                    className={cn(
                                        'min-h-11 px-1 font-sans text-sm underline-offset-4 focus-visible:outline-brand @lg:text-base',
                                        filter === item
                                            ? 'text-brand underline'
                                            : 'text-ink hover:text-brand',
                                    )}
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-1 @lg:grid-cols-4">
                        {filtered
                            .slice(0, expanded ? undefined : 8)
                            .map((item, index) => (
                                <div
                                    key={`${item.image}-${index}`}
                                    className="aspect-[1.25] overflow-hidden bg-cream"
                                >
                                    <CurtainImage
                                        name={item.image}
                                        alt={item.alt}
                                    />
                                </div>
                            ))}
                    </div>
                    {filtered.length > 8 && (
                        <div className="mt-10 text-center">
                            <button
                                type="button"
                                onClick={() => setExpanded((value) => !value)}
                                aria-expanded={expanded}
                                className={cn(pill, 'min-w-[40%]')}
                            >
                                {expanded ? 'View Less' : 'View More'}
                            </button>
                        </div>
                    )}
                </section>

                <section
                    id="curtain-styles"
                    className="scroll-mt-24 px-1 pt-24 @lg:pt-[18cqi]"
                >
                    <h2 className="font-display text-[clamp(1.1rem,3.1cqi,2.2rem)] leading-tight tracking-[-0.04em] uppercase">
                        Designed for Every Window
                    </h2>
                    <p className="mt-2 font-display text-[clamp(0.65rem,1.9cqi,1.25rem)]">
                        From Soft Sheers To Complete Light Control.
                    </p>
                    <div className="mt-5 flex h-[360px] gap-2 @lg:h-[min(46cqi,620px)] @lg:gap-2.5">
                        {styles.map((style, index) => (
                            <button
                                key={style.name}
                                type="button"
                                aria-label={style.name}
                                aria-pressed={activeStyle === index}
                                onClick={() => setActiveStyle(index)}
                                className={cn(
                                    'relative min-w-0 overflow-hidden rounded-full bg-[#d9d9d9] text-left transition-[flex-grow] duration-500 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand motion-reduce:transition-none',
                                    activeStyle === index
                                        ? 'flex-[6.5] rounded-[28px]'
                                        : 'flex-1',
                                )}
                            >
                                <CurtainImage
                                    name={style.image}
                                    alt={style.description}
                                    className={cn(
                                        'transition-opacity duration-300 motion-reduce:transition-none',
                                        activeStyle !== index &&
                                            [2, 4, 5].includes(index)
                                            ? 'opacity-0'
                                            : 'opacity-100',
                                    )}
                                />
                                {activeStyle === index ? (
                                    <span className="absolute bottom-5 left-3 max-w-[80%] rounded-xl bg-[#ad6844] px-3 py-2 font-display text-[clamp(0.6rem,1.8cqi,1.2rem)] leading-tight text-white uppercase">
                                        {style.name}
                                    </span>
                                ) : (
                                    <span
                                        aria-hidden="true"
                                        className={cn(
                                            'absolute bottom-3 left-1/2 size-5 -translate-x-1/2 rounded-full bg-[#ad6844] @lg:size-7',
                                            [2, 4, 5].includes(index) &&
                                                'opacity-0',
                                        )}
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                    <div className="mt-5 text-center">
                        <button
                            type="button"
                            className={cn(
                                pill,
                                'min-w-[64%] text-[clamp(0.6rem,1.5cqi,1rem)] uppercase',
                            )}
                            aria-expanded={allStyles}
                            aria-controls="all-curtain-styles"
                            onClick={() => setAllStyles((value) => !value)}
                        >
                            {allStyles
                                ? 'Close Curtain Styles'
                                : 'Explore All Curtain Styles'}
                        </button>
                    </div>
                    {allStyles && (
                        <div
                            id="all-curtain-styles"
                            className="mt-8 grid grid-cols-2 gap-5 @lg:grid-cols-3"
                        >
                            {styles.map((style, index) => (
                                <button
                                    key={style.name}
                                    type="button"
                                    onClick={() => {
                                        setActiveStyle(index);
                                        document
                                            .getElementById('curtain-styles')
                                            ?.scrollIntoView({
                                                block: 'start',
                                            });
                                    }}
                                    className="text-left focus-visible:outline-2 focus-visible:outline-brand"
                                >
                                    <div className="aspect-[3/4] overflow-hidden rounded-2xl">
                                        <CurtainImage
                                            name={style.image}
                                            alt={style.description}
                                        />
                                    </div>
                                    <h3 className="mt-3 font-display text-xs text-brand">
                                        {style.name}
                                    </h3>
                                    <p className="mt-2 font-sans text-sm text-ink/70">
                                        {style.description}
                                    </p>
                                </button>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </>
    );
}
