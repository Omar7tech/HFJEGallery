import { ArrowUpRight } from 'lucide-react'
import { SmartImage } from '@/components/smart-image'

interface Project {
  src: string
  alt: string
  /** Placement inside the collage grid — identical at every width. */
  className: string
}

const projects: Project[] = [
  {
    // Tall image — first column, full height.
    src: '/images/gray-stylish-modular-sofa-brick-marble-background-rustic-living-room.webp',
    alt: 'Rustic living room with a low modular sofa, arched mosaic niches and warm textiles',
    className: 'project-tall col-start-1 col-end-2 row-start-1 row-end-5',
  },
  {
    // Short banner — top-right, one row.
    src: '/images/modern-living-room-interior-design (1).webp',
    alt: 'Double-height modern living room with a sectional sofa and a wood-burning fireplace',
    className: 'project-banner col-start-2 col-end-5 row-start-1 row-end-2',
  },
  {
    // Large image — bottom-right, fills the remaining rows.
    src: '/images/modern-living-room-interior-design.webp',
    alt: 'Sunlit contemporary lounge with a sectional sofa, low table and forest views',
    className: 'col-start-2 col-end-5 row-start-2 row-end-5',
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

/**
 * Full-width CTA. Hover just deepens the terracotta and slides an arrow out
 * from behind the label — the same restrained language as the hero button.
 */
function ViewPortfolioButton() {
  return (
    <button
      type="button"
      className="group mt-3 flex w-full items-center justify-center rounded-3xl bg-brand py-6 font-medium uppercase tracking-[0.15em] text-brand-foreground text-lg transition-colors duration-300 ease-out hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand motion-reduce:transition-none @lg:text-xl"
    >
      View Portfolio
      <span
        aria-hidden="true"
        className="inline-flex max-w-0 -translate-x-2 overflow-hidden opacity-0 transition-all duration-300 ease-out group-hover:ml-3 group-hover:max-w-[1.4em] group-hover:translate-x-0 group-hover:opacity-100 motion-reduce:transition-none"
      >
        <ArrowUpRight className="size-[1.1em]" strokeWidth={2} />
      </span>
    </button>
  )
}

function FeaturedProjects() {
  return (
    <section className="@container relative w-full overflow-hidden px-6 py-10 font-display md:px-12 md:py-15 lg:pl-0 lg:pr-16">
      {/* Faded architectural background — content sits on top. Fades out toward
          the left so the text side stays clean. */}
      <SpacesPattern className="pointer-events-none absolute inset-0 z-0 text-brand/50 mask-[radial-gradient(120%_120%_at_top_right,black,transparent_65%)] [-webkit-mask-image:radial-gradient(120%_120%_at_top_right,black,transparent_65%)] opacity-[0.18]" />

      <div className="relative z-10">
        <h2 className="max-w-4xl font-display leading-[1.05] text-ink text-[clamp(2.25rem,9cqi,4.75rem)]">
          Spaces That Tell Their Own Story
        </h2>

        <p className="mt-6 max-w-2xl font-medium leading-relaxed text-brand text-base @lg:text-lg">
          Every project is unique because every family lives differently. Explore
          a portfolio of homes, apartments, restaurants, and commercial spaces
          crafted around each client's lifestyle.
        </p>

        {/* Collage: one tall image on the left, two stacked on the right. Same
            arrangement at every width — small screens just get a wider first
            column and a squatter box so the tall image doesn't become a sliver.
            Hovering the tall image widens the first column, so it borrows
            space from the two images on the right; hovering the top banner
            swaps heights with the large image below it (1:3 becomes 3:1). */}
        <div className="mt-10 grid aspect-5/4 grid-cols-[2fr_1fr_1fr_1fr] grid-rows-[1fr_1fr_1fr_1fr] gap-3 @3xl:aspect-auto @3xl:grid-cols-[1fr_1fr_1fr_1fr] @3xl:gap-5 @3xl:h-120 @3xl:transition-[grid-template-columns,grid-template-rows] @3xl:duration-500 @3xl:ease-out @3xl:has-[.project-tall:hover]:grid-cols-[2.4fr_1fr_1fr_1fr] @3xl:has-[.project-banner:hover]:grid-rows-[9fr_1fr_1fr_1fr] motion-reduce:transition-none">
          {projects.map((project) => (
            <SmartImage
              key={project.src}
              src={project.src}
              alt={project.alt}
              className={`h-full min-w-0 rounded-2xl @3xl:rounded-3xl ${project.className}`}
              imgClassName="object-cover"
            />
          ))}
        </div>

        <ViewPortfolioButton />
      </div>
    </section>
  )
}

export default FeaturedProjects
