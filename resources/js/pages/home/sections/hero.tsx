import { yearsOfExperience } from '@/lib/experience'

function Hero() {
  return (
    <section className="font-display relative w-full overflow-hidden">
      <img
        className="absolute inset-0 h-full w-full object-cover"
        src="/images/potted-plant-table.webp"
        alt="Warm living room with a cream bouclé sofa, ottoman and brass floor lamp"
      />

      <div className="relative z-10 flex min-h-[85dvh] flex-col items-end justify-between px-6 py-10 text-right md:px-12 md:py-16 lg:px-16">
        {/* Headline */}
        <h1 className="leading-[1.15] text-ink text-3xl sm:text-5xl md:text-6xl">
          <span className="block">Crafted</span>
          <span className="block">
            <span className="relative inline-block">
              <span className="relative z-10">Around</span>
              <svg
                className="pointer-events-none absolute left-1/2 top-1/2 h-[138%] w-[108%] -translate-x-1/2 -translate-y-1/2 -rotate-6 text-ink"
                viewBox="0 0 300 120"
                fill="none"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <ellipse
                  cx="150"
                  cy="60"
                  rx="146"
                  ry="52"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </span>{' '}
            Living.
          </span>
        </h1>

        {/* Subtext */}
        <p className="-translate-y-8 font-medium text-brand text-lg sm:text-xl md:-translate-y-14 md:text-2xl">
          {yearsOfExperience()} of craftsmanship,
          <br />
          creating homes designed around
          <br />
          the people who live in them.
        </p>

        {/* CTA */}
        <button
          type="button"
          className="-mr-6 bg-brand py-4 pl-8 pr-12 text-sm font-semibold uppercase tracking-[0.2em] text-brand-foreground transition-colors hover:bg-brand-hover sm:text-base md:-mr-12 lg:-mr-16 lg:pr-20"
        >
          EXPLORE OUR WORK
        </button>
      </div>
    </section>
  )
}

export default Hero
