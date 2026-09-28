import { ArrowRight } from 'lucide-react';
import { motion, useScroll, useTransform } from 'motion/react';
import type { MotionStyle } from 'motion/react';
import { useRef, useState } from 'react';
import { yearsOfExperience } from '@/lib/experience';

// How far through the hero's own scroll-out the day→night swap completes
// (1 = hero fully scrolled past). No pinning — it plays during normal scroll.
const SWAP_END = 0.3;
// Text recolors a touch later than the image, so it never changes while the
// room is still clearly in daylight.
const TEXT_START = 0.15;

/**
 * Shared "Crafted / Around Living." headline with the hand-drawn ellipse that
 * animates around "Around". Desktop only; it takes a motion `style` so it can
 * recolor on scroll.
 */
function Headline({
    style,
    className,
}: {
    style?: MotionStyle;
    className?: string;
}) {
    return (
        <motion.h1 style={style} className={className}>
            <span className="block">Crafted</span>
            <span className="block">
                <span className="relative inline-block">
                    <span className="relative z-10">Around</span>
                    <svg
                        className="pointer-events-none absolute top-1/2 left-1/2 h-[138%] w-[108%] -translate-x-1/2 -translate-y-1/2 -rotate-6"
                        viewBox="0 0 300 120"
                        fill="none"
                        preserveAspectRatio="none"
                        aria-hidden="true"
                    >
                        <motion.ellipse
                            cx="150"
                            cy="60"
                            rx="146"
                            ry="52"
                            stroke="currentColor"
                            strokeWidth="1.25"
                            vectorEffect="non-scaling-stroke"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{
                                opacity: { duration: 0.2, delay: 0.5 },
                                pathLength: {
                                    duration: 1.1,
                                    ease: 'easeInOut',
                                    delay: 0.5,
                                },
                            }}
                        />
                    </svg>
                </span>{' '}
                Living.
            </span>
        </motion.h1>
    );
}

/**
 * The "Explore our work" CTA. On mobile it's a full-width button with the
 * arrow always showing — there's no hover on touch. From `lg` it becomes the
 * squared-off bar that bleeds off the right edge of the desktop hero, and the
 * arrow slides out on hover instead.
 */
function ExploreButton({ className }: { className?: string }) {
    return (
        <button
            type="button"
            className={`group flex w-full items-center justify-center rounded-full bg-brand px-8 py-4 text-sm font-semibold tracking-[0.2em] max-lg:rounded-xl max-lg:py-3.5 max-lg:font-medium max-lg:tracking-[0.02em] max-lg:normal-case max-lg:whitespace-nowrap text-brand-foreground uppercase transition-[background-color,letter-spacing] duration-300 ease-out focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand active:bg-brand-hover motion-reduce:transition-none sm:text-base lg:inline-flex lg:w-auto lg:justify-start lg:rounded-none lg:py-4 lg:pr-12 lg:pl-8 lg:hover:bg-brand-hover lg:hover:tracking-[0.26em] ${className ?? ''}`}
        >
            Explore our work
            <span
                aria-hidden="true"
                className="ml-3 inline-flex max-w-[1.5rem] overflow-hidden transition-all duration-300 ease-out motion-reduce:transition-none lg:ml-0 lg:max-w-0 lg:-translate-x-2 lg:opacity-0 lg:group-hover:ml-3 lg:group-hover:max-w-[1.5rem] lg:group-hover:translate-x-0 lg:group-hover:opacity-100"
            >
                <ArrowRight className="size-5" strokeWidth={2.5} />
            </span>
        </button>
    );
}

function Hero() {
    const ref = useRef<HTMLElement>(null);
    const mobileImageRef = useRef<HTMLDivElement>(null);
    const [dayLoaded, setDayLoaded] = useState(false);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start start', 'end start'],
    });
    // Mobile tracks the image block itself (the desktop section is display:none
    // below lg, so its scroll progress can't be measured there).
    const { scrollYProgress: mobileProgress } = useScroll({
        target: mobileImageRef,
        offset: ['start center', 'end start'],
    });

    // Reversible day → night crossfade: it follows the scroll position both ways,
    // so scrolling down turns it night and scrolling up returns it to daylight.
    const nightOpacity = useTransform(scrollYProgress, [0, SWAP_END], [0, 1]);
    const mobileNightOpacity = useTransform(mobileProgress, [0, 1], [0, 1]);
    // Headline: dark → cream. Subtext: terracotta → white. Both track night.
    const headlineColor = useTransform(
        scrollYProgress,
        [TEXT_START, SWAP_END],
        ['#1a1614', '#e7d8c4'],
    );
    const subtextColor = useTransform(
        scrollYProgress,
        [TEXT_START, SWAP_END],
        ['#a65e3c', '#ffffff'],
    );

    return (
        <>
            {/* Mobile / tablet: clean editorial stack — image, copy, CTA. The
          headline is desktop-only; here it stays for screen readers. */}
            <section className="px-5 pt-3 pb-10 font-display lg:hidden">
                <h1 className="sr-only">Crafted Around Living.</h1>

                {/* Landscape photo with the same day → night crossfade, driven by the
            image's own scroll position. */}
                <div
                    ref={mobileImageRef}
                    className="relative aspect-square w-full overflow-hidden rounded-3xl sm:aspect-3/2"
                >
                    <img
                        className="absolute inset-0 h-full w-full object-cover"
                        src="/images/potted-plant-table-w2400.webp"
                        alt="Warm living room with a cream bouclé sofa, ottoman and brass floor lamp"
                        loading="eager"
                        decoding="async"
                        draggable={false}
                        fetchPriority="high"
                    />
                    <motion.img
                        style={{ opacity: mobileNightOpacity }}
                        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                        src="/images/potted-plant-table-night-w1535.webp"
                        alt=""
                        aria-hidden="true"
                        loading="eager"
                        decoding="async"
                        fetchPriority="low"
                    />
                </div>

                <p className="mt-5 max-w-md text-xl leading-snug text-ink sm:text-2xl">
                    {yearsOfExperience()} years of craftsmanship, creating
                    homes designed around the people who live in them.
                </p>

                <ExploreButton className="mt-6" />
            </section>

            {/* Desktop: full-height photo with the day→night scroll crossfade and
          text laid over it. */}
            <section
                ref={ref}
                className="relative hidden w-full overflow-hidden rounded-bl-3xl bg-cream font-display lg:block lg:h-dvh lg:min-h-160"
            >
                {/* Day (base) — LCP image: eager, high priority, fades in once decoded */}
                <img
                    className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out ${
                        dayLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    src="/images/potted-plant-table-w2400.webp"
                    alt="Warm living room with a cream bouclé sofa, ottoman and brass floor lamp"
                    loading="eager"
                    decoding="async"
                    draggable={false}
                    fetchPriority="high"
                    onLoad={() => setDayLoaded(true)}
                />
                {/* Night — crossfades in on scroll. Fetched early at low priority so it's
            ready by the time the user scrolls, without stealing from the LCP. */}
                <motion.img
                    style={{ opacity: nightOpacity }}
                    className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                    src="/images/potted-plant-table-night-w1535.webp"
                    alt=""
                    aria-hidden="true"
                    loading="eager"
                    decoding="async"
                    draggable={false}
                    fetchPriority="low"
                />

                {/* Overlay content */}
                <div className="relative z-10 flex h-full flex-col items-end justify-between px-12 py-16 text-right lg:px-16">
                    <Headline
                        style={{ color: headlineColor }}
                        className="text-6xl leading-[1.15]"
                    />

                    <motion.p
                        style={{ color: subtextColor }}
                        className="-translate-y-14 text-2xl font-medium"
                    >
                        {yearsOfExperience()} years of craftsmanship,
                        <br />
                        creating homes designed around
                        <br />
                        the people who live in them.
                    </motion.p>

                    <ExploreButton className="lg:-mr-16 lg:pr-20" />
                </div>
            </section>
        </>
    );
}

export default Hero;
