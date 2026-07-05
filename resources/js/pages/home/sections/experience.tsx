function Experience() {
  const stats = [
    { value: '+27', lines: ['Years', 'of Experience'], accent: false },
    { value: '+1000', lines: ['Completed', 'Projects'], accent: true },
    { value: 'Premium', lines: ['Materials', '& Fabrics'], accent: false },
    { value: 'Custom', lines: ['Furniture', '& Interiors'], accent: true },
  ]

  return (
    <section className="@container w-full px-6 py-16 font-display md:px-12 md:py-24 lg:pl-8 lg:pr-16">
      {/* Image + intro */}
      <div className="grid gap-10 @3xl:grid-cols-5 @3xl:items-end @3xl:gap-10">
        <img
          className="aspect-3/2 w-full min-w-0 object-cover @3xl:col-span-3 @3xl:aspect-4/3"
          src="/images/contemporary-house-interior-design.webp"
          alt="Sunlit contemporary living room with a large sectional sofa and floor-to-ceiling windows"
        />

        {/* nested container so the heading scales to THIS column, not the viewport */}
        <div className="@container min-w-0 @3xl:col-span-2">
          <h2 className="font-display leading-[1.15] text-ink text-[clamp(1.75rem,8cqi,3.25rem)]">
            27 Years of Craftsmanship
          </h2>

          <p className="mt-6 max-w-xl font-bold leading-relaxed text-ink text-base @lg:text-lg">
            More than two decades of transforming houses into homes through
            exceptional craftsmanship, premium materials, and personalized
            design.
          </p>

          <button
            type="button"
            className="mt-8 rounded-full border border-brand px-10 py-3 text-base font-medium text-brand transition-colors hover:bg-brand hover:text-brand-foreground"
          >
            Contact Us
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-16 grid grid-cols-2 gap-x-8 gap-y-10 @2xl:grid-cols-4 md:mt-24">
        {stats.map((stat) => (
          <div key={stat.value} className="@container min-w-0">
            <p className="font-display leading-none text-ink text-[clamp(1.5rem,15cqi,2.75rem)]">
              {stat.value}
            </p>
            <p
              className={`mt-3 leading-tight text-[clamp(0.9rem,6cqi,1.125rem)] ${
                stat.accent ? 'text-brand' : 'text-ink'
              }`}
            >
              {stat.lines[0]}
              <br />
              {stat.lines[1]}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Experience
