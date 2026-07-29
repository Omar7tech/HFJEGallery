import { ArrowRight, Plus } from 'lucide-react'
import { SmartImage } from '@/components/smart-image'

interface Product {
  name: string
  description: string
  src: string
  alt: string
}

const products: Product[] = [
  {
    name: 'Name',
    description: 'Description',
    src: '/images/bayte/brown-leather-chair-nobg.webp',
    alt: 'Oversized brown leather bean bag with two cushions',
  },
  {
    name: 'Name',
    description: 'Description',
    src: '/images/bayte/caramel-long-chair-nobg.png',
    alt: 'Caramel leather chaise longue on tapered wooden legs',
  },
  {
    name: 'Name',
    description: 'Description',
    src: '/images/bayte/chair-with-white-cushion-that-says-word-it-nobg.webp',
    alt: 'Round wooden lounge chair with white cushions',
  },
]

/**
 * The BAYTÉ wordmark rendered as a mask, so it takes its color from the
 * `bg-*` utility instead of the two fixed fills inside the SVG file.
 */
function BayteWordmark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`block aspect-[1920/518] bg-brand mask-[url(/logos/bayte.svg)] mask-contain mask-center mask-no-repeat ${className ?? ''}`}
    />
  )
}

function Bayte() {
  return (
    <section className="@container w-full px-6 py-16 font-display md:px-12 md:py-24 lg:pl-0 lg:pr-16">
      {/* Wordmark, with the "BY HFJE" endorsement tucked under its right edge. */}
      <div className="mx-auto w-full max-w-3xl @3xl:w-[78%]">
        <img
          src="/logos/bayte.svg"
          alt="BAYTÉ"
          className="block w-full"
          loading="lazy"
          decoding="async"
        />
        <p className="mt-3 text-right uppercase tracking-[0.08em] text-ink text-xs @lg:text-sm">
          By HFJE
        </p>
      </div>

      {/* Tagline on the left, the collection blurb right-aligned opposite it. */}
      <div className="mt-10 grid gap-6 @2xl:grid-cols-2 @2xl:items-start @2xl:gap-10">
        <h2 className="leading-[1.3] text-brand text-xl @lg:text-2xl">
          Fewer Pieces.
          <br />
          Better Living.
        </h2>

        <p className="leading-[1.6] text-ink text-xs @2xl:text-right @lg:text-sm">
          A Curated Collection Of Ready-To-Purchase Furniture Designed For
          Modern Lebanese Homes. Every Piece Solves A Real Living Need Through
          Thoughtful Function, Lasting Materials, And The Craftsmanship Of HFJE.
        </p>
      </div>

      {/* Product cards */}
      <div className="mt-8 grid gap-4 @xl:grid-cols-3 @2xl:gap-5">
        {products.map((product) => (
          <article
            key={product.src}
            className="flex flex-col rounded-2xl bg-[#f2f1ef] p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="leading-none text-ink text-xl">
                  {product.name}
                </h3>
                <p className="mt-2 leading-none text-ink/70 text-xs">
                  {product.description}
                </p>
              </div>

              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand text-brand-foreground">
                <Plus className="size-4" strokeWidth={2.5} />
              </span>
            </div>

            <SmartImage
              src={product.src}
              alt={product.alt}
              className="mt-5 aspect-4/3 w-full"
              imgClassName="object-contain"
            />

            <BayteWordmark className="mx-auto mt-5 w-24" />
          </article>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <button
          type="button"
          className="group flex items-center gap-3 rounded-full bg-brand px-12 py-3.5 text-brand-foreground text-base transition-colors duration-300 ease-out hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand motion-reduce:transition-none @lg:text-lg"
        >
          Discover BAYTÉ
          <ArrowRight
            className="size-5 transition-transform duration-300 ease-out group-hover:translate-x-1 motion-reduce:transition-none"
            strokeWidth={1.5}
          />
        </button>
      </div>
    </section>
  )
}

export default Bayte
