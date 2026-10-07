import { ArrowRight } from 'lucide-react';
import {
    motion,
    useMotionTemplate,
    useMotionValue,
    useReducedMotion,
    useScroll,
    useSpring,
    useTransform,
} from 'motion/react';
import type { MotionStyle } from 'motion/react';
import { useRef, useState } from 'react';
import type { PointerEvent, ReactNode } from 'react';
import { yearsOfExperience } from '@/lib/experience';

// How far through the pinned stretch the day→night swap completes (1 = the
// hero unpins). The remainder holds on night before normal scroll resumes.
const SWAP_END = 0.85;
// Where the setting sun sits in the photo — night spreads out from this point.
const SUN_ORIGIN = '92% 13%';
// Final radius of the night reveal and the width of its soft edge, in vmax.
// The radius has to clear the far corner of the (slightly oversized) scene.
const REVEAL_RADIUS = 200;
const REVEAL_FEATHER = 40;
// Lazy, weighty follow for the pointer-driven depth tilt.
const POINTER_SPRING = { stiffness: 60, damping: 18, mass: 0.6 };
const LINE_EASE = [0.16, 1, 0.3, 1] as const;

/**
 * One headline line, tipping up into place from flat on the floor.
 */
function HeadlineLine({
    index,
    children,
}: {
    index: number;
    children: ReactNode;
}) {
    return (
        <motion.span
            className="block origin-bottom"
            style={{ transformPerspective: 900 }}
            initial={{ opacity: 0, y: '0.5em', rotateX: -65 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{
                duration: 1,
                ease: LINE_EASE,
                delay: 0.2 + index * 0.14,
            }}
        >
            {children}
        </motion.span>
    );
}

/**
 * Shared "Crafted / Around Living." headline with the hand-drawn ellipse that
 * animates around "Around". Desktop only; it takes a motion `style` so it can
 * drift with the pointer.
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
            <HeadlineLine index={0}>Crafted</HeadlineLine>
            <HeadlineLine index={1}>
                <span className="relative inline-block">
                    <span className="relative z-10">Around</span>
                    <svg
                        className="pointer-events-none absolute top-1/2 left-1/2 h-[138%] w-[108%] -translate-x-1/2 -translate-y-1/2 -rotate-6 text-[#e9b97a]"
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
                                opacity: { duration: 0.2, delay: 1 },
                                pathLength: {
                                    duration: 1.1,
                                    ease: 'easeInOut',
                                    delay: 1,
                                },
                            }}
                        />
                    </svg>
                </span>{' '}
                Living.
            </HeadlineLine>
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
            className={`group flex w-full items-center justify-center rounded-full bg-brand px-8 py-4 text-sm font-semibold tracking-[0.2em] text-brand-foreground uppercase transition-[background-color,letter-spacing] duration-300 ease-out focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand active:bg-brand-hover motion-reduce:transition-none max-lg:rounded-xl max-lg:py-3.5 max-lg:font-medium max-lg:tracking-[0.02em] max-lg:whitespace-nowrap max-lg:normal-case sm:text-base lg:inline-flex lg:w-auto lg:justify-start lg:rounded-none lg:py-4 lg:pr-12 lg:pl-8 lg:hover:bg-brand-hover lg:hover:tracking-[0.26em] ${className ?? ''}`}
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
    const pinRef = useRef<HTMLDivElement>(null);
    const mobileImageRef = useRef<HTMLDivElement>(null);
    const [dayLoaded, setDayLoaded] = useState(false);
    const { scrollYProgress } = useScroll({
        target: pinRef,
        offset: ['start start', 'end end'],
    });
    // Mobile tracks the image block itself (the desktop section is display:none
    // below lg, so its scroll progress can't be measured there).
    const { scrollYProgress: mobileProgress } = useScroll({
        target: mobileImageRef,
        offset: ['start center', 'end start'],
    });

    const mobileNightOpacity = useTransform(mobileProgress, [0, 1], [0, 1]);

    // Night spreads out from the setting sun as a soft-edged circle rather than
    // a flat crossfade. It follows the scroll both ways, so scrolling back up
    // returns the room to daylight.
    const revealRadius = useTransform(
        scrollYProgress,
        [0, SWAP_END],
        [0, REVEAL_RADIUS],
    );
    const revealCore = useTransform(
        revealRadius,
        (radius) => radius - REVEAL_FEATHER,
    );
    const nightMask = useMotionTemplate`radial-gradient(circle at ${SUN_ORIGIN}, #000 ${revealCore}vmax, transparent ${revealRadius}vmax)`;
    // Slow push-in across the whole pin, like a camera easing into the room.
    const sceneScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

    // Pointer depth: the room tilts and slides one way while the copy drifts
    // the other, so the text reads as floating in front of the photo.
    const reduceMotion = useReducedMotion();
    const pointerX = useMotionValue(0);
    const pointerY = useMotionValue(0);
    const tiltX = useSpring(pointerX, POINTER_SPRING);
    const tiltY = useSpring(pointerY, POINTER_SPRING);
    const sceneRotateY = useTransform(tiltX, [-0.5, 0.5], [-2.5, 2.5]);
    const sceneRotateX = useTransform(tiltY, [-0.5, 0.5], [2, -2]);
    const sceneX = useTransform(tiltX, [-0.5, 0.5], [20, -20]);
    const sceneY = useTransform(tiltY, [-0.5, 0.5], [14, -14]);
    const copyX = useTransform(tiltX, [-0.5, 0.5], [-12, 12]);
    const copyY = useTransform(tiltY, [-0.5, 0.5], [-8, 8]);

    const trackPointer = (event: PointerEvent<HTMLElement>) => {
        if (reduceMotion || event.pointerType !== 'mouse') {
            return;
        }

        const bounds = event.currentTarget.getBoundingClientRect();
        pointerX.set((event.clientX - bounds.left) / bounds.width - 0.5);
        pointerY.set((event.clientY - bounds.top) / bounds.height - 0.5);
    };

    const releasePointer = () => {
        pointerX.set(0);
        pointerY.set(0);
    };

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
                        src="/images/hero-day.webp"
                        alt="Living room with a cream bouclé sofa, lounge chairs and a glass coffee table overlooking the city at sunset"
                        loading="eager"
                        decoding="async"
                        draggable={false}
                        fetchPriority="high"
                    />
                    <motion.img
                        style={{ opacity: mobileNightOpacity }}
                        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                        src="/images/hero-night.webp"
                        alt=""
                        aria-hidden="true"
                        loading="eager"
                        decoding="async"
                        fetchPriority="low"
                    />
                </div>

                <p className="mt-5 max-w-md text-xl leading-snug text-ink sm:text-2xl">
                    {yearsOfExperience()} years of craftsmanship, creating homes
                    designed around the people who live in them.
                </p>

                <ExploreButton className="mt-6" />
            </section>

            {/* Desktop: full-height photo with copy laid over it. The tall wrapper
          is the pin track — the photo sticks for the extra 80dvh while night
          falls, then scrolls away. */}
            <div
                ref={pinRef}
                className="hidden lg:block lg:h-[calc(max(100dvh,40rem)+80dvh)]"
            >
                <section
                    onPointerMove={trackPointer}
                    onPointerLeave={releasePointer}
                    style={{ perspective: 1400 }}
                    className="sticky top-0 h-dvh min-h-160 w-full overflow-hidden rounded-bl-3xl bg-cream font-display"
                >
                    {/* The room. Oversized so the tilt never exposes an edge. */}
                    <motion.div
                        style={{
                            x: sceneX,
                            y: sceneY,
                            rotateX: sceneRotateX,
                            rotateY: sceneRotateY,
                            scale: sceneScale,
                        }}
                        className="absolute -inset-[6%] will-change-transform"
                    >
                        {/* Day (base) — LCP image: eager, high priority, fades in once decoded */}
                        <img
                            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out ${
                                dayLoaded ? 'opacity-100' : 'opacity-0'
                            }`}
                            src="/images/hero-day.webp"
                            alt="Living room with a cream bouclé sofa, lounge chairs and a glass coffee table overlooking the city at sunset"
                            loading="eager"
                            decoding="async"
                            draggable={false}
                            fetchPriority="high"
                            onLoad={() => setDayLoaded(true)}
                        />
                        {/* Night — revealed through the growing mask. Fetched early at low
              priority so it's ready by the time the user scrolls, without
              stealing from the LCP. */}
                        <motion.img
                            style={{
                                maskImage: nightMask,
                                WebkitMaskImage: nightMask,
                            }}
                            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                            src="/images/hero-night.webp"
                            alt=""
                            aria-hidden="true"
                            loading="eager"
                            decoding="async"
                            draggable={false}
                            fetchPriority="low"
                        />
                    </motion.div>

                    {/* Scrim pooled in the bottom-left corner so the copy holds its
            contrast over the pale floor in both day and night. */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_95%_at_0%_100%,rgb(20_14_10/0.86)_0%,rgb(20_14_10/0.55)_32%,transparent_68%)]"
                    />

                    {/* Copy — bottom-left, drifting against the room for depth */}
                    <motion.div
                        style={{ x: copyX, y: copyY }}
                        className="absolute bottom-14 left-12 z-10 lg:left-16"
                    >
                        <Headline className="text-5xl leading-[1.14] text-[#f7eedf] [text-shadow:0_2px_28px_rgb(0_0_0/0.35)] xl:text-6xl 2xl:text-7xl" />

                        <motion.p
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.9,
                                ease: LINE_EASE,
                                delay: 0.6,
                            }}
                            className="mt-6 max-w-md text-lg leading-relaxed text-white/85 xl:mt-8 xl:text-xl"
                        >
                            {yearsOfExperience()} years of craftsmanship,
                            creating homes designed around the people who live
                            in them.
                        </motion.p>
                    </motion.div>

                    <ExploreButton className="absolute right-0 bottom-14 z-10" />
                </section>
            </div>
        </>
    );
}

export default Hero;
