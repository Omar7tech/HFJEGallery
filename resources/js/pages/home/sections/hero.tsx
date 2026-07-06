import { yearsOfExperience } from '@/lib/experience'
import { ArrowRight } from 'lucide-react'
import { motion, useScroll, useTransform, type MotionStyle } from 'motion/react'
import { useRef, useState } from 'react'

// How far through the hero's own scroll-out the day→night swap completes
// (1 = hero fully scrolled past). No pinning — it plays during normal scroll.
const SWAP_END = 0.3
// Text recolors a touch later than the image, so it never changes while the
// room is still clearly in daylight.
const TEXT_START = 0.15

/**
 * Shared "Crafted / Around Living." headline with the hand-drawn ellipse that
 * animates around "Around". The desktop hero passes a motion `style` so it can
 * recolor on scroll; the mobile hero styles it statically via `className`.
 */
function Headline({
  style,
  className,
}: {
  style?: MotionStyle
  className?: string
}) {
  return (
    <motion.h1 style={style} className={className}>
      <span className="block">Crafted</span>
      <span className="block">
        <span className="relative inline-block">
          <span className="relative z-10">Around</span>
          <svg
            className="pointer-events-none absolute left-1/2 top-1/2 h-[138%] w-[108%] -translate-x-1/2 -translate-y-1/2 -rotate-6"
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
                pathLength: { duration: 1.1, ease: 'easeInOut', delay: 0.5 },
              }}
            />
          </svg>
        </span>{' '}
        Living.
      </span>
    </motion.h1>
  )
}

/** The "EXPLORE OUR WORK" pill with the arrow that slides out on hover. */
function ExploreButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      className={`group inline-flex items-center bg-brand py-4 pl-8 pr-12 text-sm font-semibold uppercase tracking-[0.2em] text-brand-foreground transition-[background-color,letter-spacing] duration-300 ease-out hover:bg-brand-hover hover:tracking-[0.26em] motion-reduce:transition-none sm:text-base ${className ?? ''}`}
    >
      EXPLORE OUR WORK
      <span
        aria-hidden="true"
        className="inline-flex max-w-0 -translate-x-2 overflow-hidden opacity-0 transition-all duration-300 ease-out group-hover:ml-3 group-hover:max-w-[1.5rem] group-hover:translate-x-0 group-hover:opacity-100 motion-reduce:transition-none"
      >
        <ArrowRight className="size-5" strokeWidth={2.5} />
      </span>
    </button>
  )
}

function Hero() {
  const ref = useRef<HTMLElement>(null)
  const mobileImageRef = useRef<HTMLDivElement>(null)
  const [dayLoaded, setDayLoaded] = useState(false)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  // Mobile tracks the image block itself (the desktop section is display:none
  // below lg, so its scroll progress can't be measured there).
  const { scrollYProgress: mobileProgress } = useScroll({
    target: mobileImageRef,
    offset: ['start center', 'end start'],
  })

  // Reversible day → night crossfade: it follows the scroll position both ways,
  // so scrolling down turns it night and scrolling up returns it to daylight.
  const nightOpacity = useTransform(scrollYProgress, [0, SWAP_END], [0, 1])
  const mobileNightOpacity = useTransform(mobileProgress, [0, 1], [0, 1])
  // Headline: dark → cream. Subtext: terracotta → white. Both track night.
  const headlineColor = useTransform(
    scrollYProgress,
    [TEXT_START, SWAP_END],
    ['#1a1614', '#e7d8c4'],
  )
  const subtextColor = useTransform(
    scrollYProgress,
    [TEXT_START, SWAP_END],
    ['#a65e3c', '#ffffff'],
  )

  return (
    <>
      {/* Mobile / tablet: clean editorial stack — headline, image, copy, CTA.
          Nothing overlaps the photo; it reads top-to-bottom. */}
      <section className="font-display px-6 pb-14 pt-10 lg:hidden">
        <Headline className="leading-[1.1] text-ink text-4xl sm:text-5xl" />

        {/* Landscape photo with the same day → night crossfade, driven by the
            image's own scroll position. */}
        <div
          ref={mobileImageRef}
          className="relative mt-8 aspect-3/2 w-full overflow-hidden"
        >
          <img
            className="absolute inset-0 h-full w-full object-cover"
            src="/images/potted-plant-table.webp"
            alt="Warm living room with a cream bouclé sofa, ottoman and brass floor lamp"
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
          <motion.img
            style={{ opacity: mobileNightOpacity }}
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
            src="/images/potted-plant-table-night.png"
            alt=""
            aria-hidden="true"
            loading="eager"
            decoding="async"
            fetchPriority="low"
          />
        </div>

        <p className="mt-8 max-w-md font-medium leading-relaxed text-brand text-lg sm:text-xl">
          {yearsOfExperience()} of craftsmanship, creating homes designed around
          the people who live in them.
        </p>

        <ExploreButton className="mt-8" />
      </section>

      {/* Desktop: full-height photo with the day→night scroll crossfade and
          text laid over it. */}
      <section
        ref={ref}
        className="font-display relative hidden w-full overflow-hidden bg-cream lg:block lg:h-dvh lg:min-h-[640px]"
      >
        {/* Day (base) — LCP image: eager, high priority, fades in once decoded */}
        <img
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out ${
            dayLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          src="/images/potted-plant-table.webp"
          alt="Warm living room with a cream bouclé sofa, ottoman and brass floor lamp"
          loading="eager"
          decoding="async"
          fetchPriority="high"
          onLoad={() => setDayLoaded(true)}
        />
        {/* Night — crossfades in on scroll. Fetched early at low priority so it's
            ready by the time the user scrolls, without stealing from the LCP. */}
        <motion.img
          style={{ opacity: nightOpacity }}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          src="/images/potted-plant-table-night.png"
          alt=""
          aria-hidden="true"
          loading="eager"
          decoding="async"
          fetchPriority="low"
        />

        {/* Overlay content */}
        <div className="relative z-10 flex h-full flex-col items-end justify-between px-12 py-16 text-right lg:px-16">
          <Headline
            style={{ color: headlineColor }}
            className="leading-[1.15] text-6xl"
          />

          <motion.p
            style={{ color: subtextColor }}
            className="-translate-y-14 font-medium text-2xl"
          >
            {yearsOfExperience()} of craftsmanship,
            <br />
            creating homes designed around
            <br />
            the people who live in them.
          </motion.p>

          <ExploreButton className="-mr-12 pr-12 lg:-mr-16 lg:pr-20" />
        </div>
      </section>
    </>
  )
}

export default Hero
