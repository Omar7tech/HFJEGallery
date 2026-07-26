import { SmartImage } from '@/components/smart-image'

interface Project {
  src: string
  alt: string
  /** Placement inside the desktop collage grid. */
  className: string
  /** Aspect ratio used when the images stack on small screens. */
  mobileClassName: string
}

const projects: Project[] = [
  {
    // Tall image — first column, full height.
    src: '/images/gray-stylish-modular-sofa-brick-marble-background-rustic-living-room.webp',
    alt: 'Rustic living room with a low modular sofa, arched mosaic niches and warm textiles',
    className:
      '@3xl:col-start-1 @3xl:col-end-2 @3xl:row-start-1 @3xl:row-end-5 @3xl:aspect-auto @3xl:h-full',
    mobileClassName: 'aspect-4/5',
  },
  {
    // Short banner — top-right, one row.
    src: '/images/modern-living-room-interior-design (1).webp',
    alt: 'Double-height modern living room with a sectional sofa and a wood-burning fireplace',
    className:
      '@3xl:col-start-2 @3xl:col-end-5 @3xl:row-start-1 @3xl:row-end-2 @3xl:aspect-auto @3xl:h-full',
    mobileClassName: 'aspect-16/7',
  },
  {
    // Large image — bottom-right, fills the remaining rows.
    src: '/images/modern-living-room-interior-design.webp',
    alt: 'Sunlit contemporary lounge with a sectional sofa, low table and forest views',
    className:
      '@3xl:col-start-2 @3xl:col-end-5 @3xl:row-start-2 @3xl:row-end-5 @3xl:aspect-auto @3xl:h-full',
    mobileClassName: 'aspect-3/2',
  },
]

/**
 * Seamless architectural line pattern used as a faded section background:
 * a grid of concentric squares ("spaces"/rooms). Tiles perfectly, so it never
 * looks cropped. Color comes from `currentColor`.
 */
function SpacesPattern({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      width="100%"
      height="100%"
    >
      <defs>
        <pattern
          id="spaces-grid"
          width="112"
          height="112"
          patternUnits="userSpaceOnUse"
        >
          <g fill="none" stroke="currentColor" strokeWidth="1">
            <rect x="0" y="0" width="112" height="112" />
            <rect x="28" y="28" width="56" height="56" />
            <rect x="48" y="48" width="16" height="16" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#spaces-grid)" />
    </svg>
  )
}

function FeaturedProjects() {
  return (
    <section className="@container relative w-full overflow-hidden px-6 py-10 font-display md:px-12 md:py-15 lg:pl-0 lg:pr-16">
      {/* Faded architectural background — content sits on top. Fades out toward
          the left so the text side stays clean. */}
      <SpacesPattern className="pointer-events-none absolute inset-0 z-0 text-brand/50 mask-[linear-gradient(to_left,black,transparent_70%)] [-webkit-mask-image:linear-gradient(to_left,black,transparent_70%)] opacity-[0.18]" />

      <div className="relative z-10">
        <h2 className="max-w-4xl font-display leading-[1.05] text-ink text-[clamp(2.25rem,9cqi,4.75rem)]">
          Spaces That Tell Their Own Story
        </h2>

        <p className="mt-6 max-w-2xl font-medium leading-relaxed text-brand text-base @lg:text-lg">
          Every project is unique because every family lives differently. Explore
          a portfolio of homes, apartments, restaurants, and commercial spaces
          crafted around each client's lifestyle.
        </p>

        {/* Collage: one tall image on the left, two stacked on the right.
            Stacks vertically below the @3xl container width. */}
        <div className="mt-10 flex flex-col gap-4 @3xl:grid @3xl:grid-cols-[1fr_1fr_1fr_1fr] @3xl:grid-rows-[1fr_1fr_1fr_1fr] @3xl:gap-[28px] @3xl:h-[30rem]">
          {projects.map((project) => (
            <SmartImage
              key={project.src}
              src={project.src}
              alt={project.alt}
              className={`min-w-0 rounded-3xl ${project.mobileClassName} ${project.className}`}
              imgClassName="object-cover"
            />
          ))}
        </div>

        <button
          type="button"
          className="mt-3 block w-full rounded-3xl bg-brand py-6 text-center font-medium uppercase tracking-[0.15em] text-brand-foreground text-lg @lg:text-xl"
        >
          View Portfolio
        </button>
      </div>
    </section>
  )
}

export default FeaturedProjects
