import { yearsOfExperience } from '@/lib/experience'
import { ArrowRight } from 'lucide-react'
import { motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'

// How far through the hero's own scroll-out the day→night swap completes
// (1 = hero fully scrolled past). No pinning — it plays during normal scroll.
const SWAP_END = 0.3
// Text recolors a touch later than the image, so it never changes while the
// room is still clearly in daylight.
const TEXT_START = 0.15

function Hero() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  // Reversible day → night crossfade: it follows the scroll position both ways,
  // so scrolling down turns it night and scrolling up returns it to daylight.
  const nightOpacity = useTransform(scrollYProgress, [0, SWAP_END], [0, 1])
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
    <section
      ref={ref}
      className="font-display relative h-[85dvh] w-full overflow-hidden lg:h-dvh"
    >
      {/* Day (base) */}
      <img
          className="absolute inset-0 h-full w-full object-cover"
          src="/images/potted-plant-table.webp"
          alt="Warm living room with a cream bouclé sofa, ottoman and brass floor lamp"
        />
        {/* Night — crossfades in on scroll */}
        <motion.img
          style={{ opacity: nightOpacity }}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          src="/images/potted-plant-table-night.png"
          alt=""
          aria-hidden="true"
        />

        {/* Overlay content */}
        <div className="relative z-10 flex h-full flex-col items-end justify-between px-6 py-10 text-right md:px-12 md:py-16 lg:px-16">
          {/* Headline */}
          <motion.h1
            style={{ color: headlineColor }}
            className="leading-[1.15] text-3xl sm:text-5xl md:text-6xl"
          >
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

          {/* Subtext */}
          <motion.p
            style={{ color: subtextColor }}
            className="-translate-y-8 font-medium text-lg sm:text-xl md:-translate-y-14 md:text-2xl"
          >
            {yearsOfExperience()} of craftsmanship,
            <br />
            creating homes designed around
            <br />
            the people who live in them.
          </motion.p>

          {/* CTA */}
          <button
            type="button"
            className="group -mr-6 inline-flex items-center bg-brand py-4 pl-8 pr-12 text-sm font-semibold uppercase tracking-[0.2em] text-brand-foreground transition-[background-color,letter-spacing] duration-300 ease-out hover:bg-brand-hover hover:tracking-[0.26em] motion-reduce:transition-none sm:text-base md:-mr-12 lg:-mr-16 lg:pr-20"
          >
            EXPLORE OUR WORK
            <span
              aria-hidden="true"
              className="inline-flex max-w-0 -translate-x-2 overflow-hidden opacity-0 transition-all duration-300 ease-out group-hover:ml-3 group-hover:max-w-[1.5rem] group-hover:translate-x-0 group-hover:opacity-100 motion-reduce:transition-none"
            >
              <ArrowRight className="size-5" strokeWidth={2.5} />
            </span>
          </button>
        </div>
    </section>
  )
}

export default Hero
