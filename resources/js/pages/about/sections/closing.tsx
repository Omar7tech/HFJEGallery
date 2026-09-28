import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

/** The invitation to start, over the home page's living room at night. */
function Closing() {
    return (
        <section className="w-full px-5 pt-4 pb-16 font-display md:px-12 md:pb-20 lg:pr-16 lg:pl-0">
            <div className="@container relative isolate flex min-h-80 flex-col justify-end overflow-hidden rounded-3xl bg-ink px-6 py-8 md:min-h-96 md:px-10 md:py-10">
                <img
                    src="/images/potted-plant-table-night-w1535.webp"
                    alt=""
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                    className="absolute inset-0 -z-10 size-full object-cover"
                />
                <span
                    aria-hidden="true"
                    className="absolute inset-0 -z-10 bg-linear-to-t from-ink/85 via-ink/40 to-ink/10"
                />

                <h2 className="text-[clamp(1.75rem,5cqi,3rem)] leading-[1.1] text-cream">
                    Let&rsquo;s shape your space.
                </h2>
                <p className="mt-3 max-w-md font-sans text-base leading-relaxed text-white/75">
                    A room, a whole home, curtains or just an idea. Tell us
                    about it.
                </p>
                <Link
                    href="/contact"
                    className="group mt-6 inline-flex w-fit items-center gap-3 rounded-full bg-brand px-8 py-3.5 text-sm text-brand-foreground transition-colors duration-300 hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cream"
                >
                    Get in touch
                    <ArrowRight
                        className="size-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none"
                        strokeWidth={2}
                    />
                </Link>
            </div>
        </section>
    );
}

export default Closing;
