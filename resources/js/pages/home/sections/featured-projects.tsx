interface Project {
  src: string
  alt: string
  className: string
}

const projects: Project[] = [
  {
    src: '/images/gray-stylish-modular-sofa-brick-marble-background-rustic-living-room.webp',
    alt: 'Rustic living room with a low modular sofa, warm textiles and a marble backdrop',
    className: 'col-span-2 aspect-3/2 @3xl:aspect-4/5 @3xl:w-[44%]',
  },
  {
    src: '/images/modern-living-room-interior-design.webp',
    alt: 'Double-height modern living room with a sectional sofa and a wood-burning fireplace',
    className: 'aspect-4/5 @3xl:w-[31%]',
  },
  {
    src: '/images/beige-sofa-contemporary-living-room-minimalist-interior-neutral-colors.webp',
    alt: 'Minimalist contemporary room with arched niches and a beige sofa in neutral tones',
    className: 'aspect-4/5 @3xl:w-[22%]',
  },
]

function FeaturedProjects() {
  return (
    <section className="@container w-full px-6 py-10 font-display md:px-12 md:py-15 lg:pl-0 lg:pr-16">
      <div className="grid gap-10 @3xl:grid-cols-12 @3xl:items-end @3xl:gap-10">
        <div className="@container min-w-0 @3xl:col-span-3">
          <h2 className="font-display leading-[1.15] text-ink text-[clamp(1.75rem,8cqi,3.25rem)]">
            Featured Projects.
          </h2>

          <p className="mt-6 max-w-xs font-bold leading-relaxed text-ink text-base @lg:text-lg">
            Every project is unique because every family lives differently.
            Explore a portfolio of homes, apartments, restaurants, and commercial
            spaces crafted around each client's lifestyle.
          </p>
        </div>

        <div className="min-w-0 @3xl:col-span-9">
          <div className="group/collage grid grid-cols-2 gap-3 @3xl:flex @3xl:items-start @3xl:justify-end @3xl:gap-2">
            {projects.map((project) => (
              <div
                key={project.src}
                className={`group relative min-w-0 overflow-hidden ${project.className} @3xl:transition @3xl:duration-500 @3xl:ease-out @3xl:group-hover/collage:opacity-40 @3xl:group-hover/collage:saturate-50 @3xl:hover:!opacity-100 @3xl:hover:-translate-y-1.5 @3xl:hover:!saturate-100 @3xl:hover:shadow-2xl @3xl:hover:shadow-ink/25 motion-reduce:transition-none`}
              >
                <img
                  className="h-full w-full object-cover transition-transform duration-[600ms] ease-out @3xl:group-hover:scale-[1.06] motion-reduce:transition-none"
                  src={project.src}
                  alt={project.alt}
                  loading="lazy"
                  decoding="async"
                />
                <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/40 to-transparent opacity-0 transition-opacity duration-500 @3xl:group-hover:opacity-100 motion-reduce:transition-none" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-12 flex justify-center md:mt-16">
        <button
          type="button"
          className="rounded-full border border-brand px-10 py-3 text-base font-medium text-brand transition-colors hover:bg-brand hover:text-brand-foreground"
        >
          View Portfolio
        </button>
      </div>
    </section>
  )
}

export default FeaturedProjects
