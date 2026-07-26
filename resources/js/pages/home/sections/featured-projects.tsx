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

function FeaturedProjects() {
  return (
    <section className="@container w-full px-6 py-10 font-display md:px-12 md:py-15 lg:pl-0 lg:pr-16">
      <h2 className="max-w-4xl font-display leading-[1.05] text-ink text-[clamp(2.25rem,9cqi,4.75rem)]">
        Spaces That Tell Their Own Story
      </h2>

      <p className="mt-6 max-w-2xl font-medium leading-relaxed text-brand text-base @lg:text-lg">
        Every project is unique because every family lives differently. Explore a
        portfolio of homes, apartments, restaurants, and commercial spaces crafted
        around each client's lifestyle.
      </p>

      {/* Collage: one tall image on the left, two stacked on the right.
          Stacks vertically below the @3xl container width. */}
      <div className="mt-10 flex flex-col gap-4 @3xl:grid @3xl:grid-cols-[1fr_1fr_1fr_1fr] @3xl:grid-rows-[1fr_1fr_1fr_1fr] @3xl:gap-[28px] @3xl:h-[40rem]">
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
    </section>
  )
}

export default FeaturedProjects
