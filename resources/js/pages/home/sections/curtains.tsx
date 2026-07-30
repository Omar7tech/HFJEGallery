import { SmartImage } from '@/components/smart-image'
import { cn } from '@/lib/utils'

interface Shot {
  src: string
  alt: string
  /** Column span in the 7-column desktop grid, plus its stacked aspect. */
  className: string
}

const gallery: Shot[] = [
  {
    src: '/images/women-opening-curtain.webp',
    alt: 'Woman drawing a floor-length curtain open to let daylight into a room',
    className: 'aspect-4/5 @2xl:col-span-3',
  },
  {
    src: '/images/curtain.webp',
    alt: 'Curtain fabrics in linen, suede and sheer weaves hung side by side',
    className: 'aspect-3/2 @2xl:col-span-4',
  },
]

interface Action {
  label: string
  /** Solid terracotta instead of soft cream — one per row. */
  filled?: boolean
}

/** Plain buttons for now; behaviour to come. */
const actions: Action[] = [
  { label: 'Curtain Styles' },
  { label: 'Projects', filled: true },
  { label: 'Fabric Library' },
]

function Curtains() {
  return (
    <section className="@container w-full px-6 py-16 font-display md:px-12 md:py-24 lg:pl-0 lg:pr-16">
      <h2 className="max-w-4xl font-display leading-[1.05] text-ink text-[clamp(2rem,8cqi,3.5rem)]">
        Curtains &amp; Textiles
      </h2>

      <p className="mt-6 leading-[1.4] text-ink text-lg @lg:text-2xl">
        The Finishing Layer Of Every Room.
      </p>

      <p className="mt-5 max-w-3xl leading-[1.7] text-brand text-sm @lg:text-base">
        From Fabric Selection And Precise Measurements To Tailoring And
        Installation, HFJE Creates Custom Curtain Solutions Designed Around The
        Light, Proportions, And Character Of Each Space.
      </p>

      {/* Narrow portrait beside a wider fabric study — 3 / 4 of a 7-col grid. */}
      <div className="mt-8 grid gap-3 @2xl:h-110 @2xl:grid-cols-7 @2xl:gap-5">
        {gallery.map((shot) => (
          <SmartImage
            key={shot.src}
            src={shot.src}
            alt={shot.alt}
            className={cn(
              'group min-w-0 rounded-2xl @2xl:aspect-auto @2xl:h-full @2xl:rounded-3xl',
              shot.className,
            )}
            imgClassName="object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none"
          />
        ))}
      </div>

      {/* The terracotta button sits proud of the row and is sized to its label,
          while the others share the remaining width. */}
      <div className="mt-3 flex flex-col gap-3 @lg:flex-row @lg:items-stretch @lg:gap-4">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            className={cn(
              'rounded-2xl tracking-[0.02em] transition-colors duration-300 ease-out focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand motion-reduce:transition-none @lg:rounded-3xl @lg:text-lg',
              action.filled
                ? 'bg-brand py-6 text-brand-foreground hover:bg-brand-hover @lg:-my-1 @lg:shrink-0 @lg:px-14'
                : 'bg-cream/40 py-5 text-brand hover:bg-cream/70 @lg:flex-1',
            )}
          >
            {action.label}
          </button>
        ))}
      </div>
    </section>
  )
}

export default Curtains
