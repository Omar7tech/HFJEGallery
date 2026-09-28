import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import BayteAddedToast from '@/components/bayte-added-toast';
import BayteProductCard from '@/components/bayte-product-card';
import BayteWordmarkDraw from '@/components/bayte-wordmark-draw';

export interface BayteHomeProduct {
    slug: string;
    name: string;
    description: string;
    /** The cutout, or the placeholder. */
    image: string;
}

/** The BAYTÉ teaser, showing the pieces picked for it in the dashboard. */
function Bayte({ products }: { products: BayteHomeProduct[] }) {
    return (
        <section className="@container w-full px-5 py-16 font-display max-md:py-10 md:px-12 md:py-24 lg:pr-16 lg:pl-0">
            {/* Wordmark, with the "BY HFJE" endorsement tucked under its right edge. */}
            <div className="w-full max-w-3xl max-md:w-[82%] @3xl:w-[78%]">
                <BayteWordmarkDraw className="block w-full" />
                <p className="mt-3 text-right text-xs tracking-[0.08em] text-ink uppercase @lg:text-sm">
                    By HFJE
                </p>
            </div>

            {/* Tagline on the left, the collection blurb right-aligned opposite it. */}
            <div className="mt-10 grid gap-6 max-md:mt-6 max-md:gap-3 @2xl:grid-cols-2 @2xl:items-start @2xl:gap-10">
                <h2 className="text-2xl leading-[1.3] text-brand @lg:text-3xl">
                    Fewer Pieces.
                    <br />
                    Better Living.
                </h2>

                <p className="font-sans text-base leading-relaxed text-ink max-md:text-[15px] @2xl:text-right">
                    A curated collection of ready-to-purchase furniture designed
                    for modern Lebanese homes. Every piece solves a real living
                    need through thoughtful function, lasting materials, and the
                    craftsmanship of HFJE.
                </p>
            </div>

            {products.length > 0 && (
                // Phones swipe through the pieces; wider screens keep the grid.
                <div className="mt-8 grid gap-4 max-md:-mx-5 max-md:flex max-md:snap-x max-md:snap-mandatory max-md:scroll-px-5 max-md:[scrollbar-width:none] max-md:overflow-x-auto max-md:px-5 max-md:pb-2 @xl:grid-cols-3 @2xl:gap-5">
                    {products.map((product) => (
                        <BayteProductCard
                            key={product.slug}
                            slug={product.slug}
                            name={product.name}
                            description={product.description}
                            src={product.image}
                            alt={product.name}
                            className="max-md:w-[72%] max-md:shrink-0 max-md:snap-start"
                        />
                    ))}
                </div>
            )}

            <div className="mt-8 flex justify-center max-md:mt-6">
                <Link
                    href="/bayte"
                    prefetch
                    className="group flex items-center gap-3 rounded-full bg-brand px-12 py-3.5 text-base text-brand-foreground transition-colors duration-300 ease-out hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand motion-reduce:transition-none max-md:w-full max-md:justify-center max-md:rounded-xl max-md:py-3.5 max-md:text-sm @lg:text-lg"
                >
                    Discover BAYTÉ
                    <ArrowRight
                        className="size-5 transition-transform duration-300 ease-out group-hover:translate-x-1 motion-reduce:transition-none"
                        strokeWidth={1.5}
                    />
                </Link>
            </div>

            <BayteAddedToast />
        </section>
    );
}

export default Bayte;
