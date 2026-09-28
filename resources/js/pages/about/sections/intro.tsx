import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { FOUNDING_YEAR } from '@/lib/experience';

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The opening: who the studio is in one line, beside the kind of room it
 * makes. The photo opens from its centre on arrival.
 */
function Intro() {
    const reducedMotion = useReducedMotion();

    return (
        <section className="@container w-full px-5 pt-8 pb-12 font-display max-md:pt-5 max-md:pb-9 md:px-12 md:pt-12 md:pb-16 lg:pr-16 lg:pl-0">
            <div className="grid gap-8 @4xl:grid-cols-12 @4xl:items-center @4xl:gap-12">
                <motion.div
                    initial={reducedMotion ? false : { opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: EASE }}
                    className="@4xl:col-span-5"
                >
                    <p className="font-sans text-xs tracking-[0.2em] text-brand uppercase">
                        About HFJE
                    </p>
                    <h1 className="mt-4 text-[clamp(2rem,4.4cqi,3.25rem)] leading-[1.1] text-ink">
                        We turn houses into homes.
                    </h1>
                    <p className="mt-5 max-w-md font-sans text-base leading-relaxed text-ink/70">
                        A family studio working across interiors, curtains and
                        furniture since {FOUNDING_YEAR}.
                    </p>
                    <Link
                        href="/work"
                        prefetch
                        className="group mt-8 inline-flex items-center gap-3 rounded-full bg-brand px-8 py-3.5 text-sm text-brand-foreground transition-colors duration-300 hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand max-md:mt-6 max-md:w-full max-md:justify-center max-md:rounded-xl max-md:font-sans max-md:font-medium"
                    >
                        See our work
                        <ArrowRight
                            className="size-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none"
                            strokeWidth={2}
                        />
                    </Link>
                </motion.div>

                <motion.div
                    initial={
                        reducedMotion
                            ? false
                            : { clipPath: 'inset(8% 10% 8% 10% round 24px)' }
                    }
                    animate={{ clipPath: 'inset(0% 0% 0% 0% round 24px)' }}
                    transition={{ duration: 1.2, ease: EASE, delay: 0.15 }}
                    className="aspect-4/3 overflow-hidden rounded-3xl bg-cream @4xl:col-span-7"
                >
                    <img
                        src="/images/modern-living-room-interior-design-w1600.webp"
                        alt="Sunlit double-height living room with a pale sectional sofa, oak floor and a fireplace"
                        loading="eager"
                        fetchPriority="high"
                        decoding="async"
                        draggable={false}
                        className="size-full object-cover"
                    />
                </motion.div>
            </div>
        </section>
    );
}

export default Intro;
