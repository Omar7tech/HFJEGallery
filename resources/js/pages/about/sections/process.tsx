import { motion, useReducedMotion } from 'motion/react';

const steps: { title: string; body: string }[] = [
    {
        title: 'Listen',
        body: 'We start in the room itself, with the people who live in it and the way they use it.',
    },
    {
        title: 'Measure',
        body: 'Precise measurements on site, so every piece is cut for its room, not for a catalogue.',
    },
    {
        title: 'Select',
        body: 'Fabrics, finishes and materials chosen together, for their weight, their fall and the light.',
    },
    {
        title: 'Craft',
        body: 'Tailoring, upholstery and furniture made with the care of decades of practice.',
    },
    {
        title: 'Install',
        body: 'Our team fits everything in place and hands over a finished room.',
    },
];

/** How a room comes together, read left to right like the work itself. */
function Process() {
    const reducedMotion = useReducedMotion();

    return (
        <section className="@container w-full px-5 py-12 font-display md:px-12 md:py-16 lg:pr-16 lg:pl-0">
            <h2 className="max-w-xl text-[clamp(1.5rem,4cqi,2.25rem)] leading-[1.15] text-ink">
                From first visit to final fitting.
            </h2>

            <ol className="mt-8 grid gap-x-6 gap-y-8 @lg:grid-cols-2 @4xl:grid-cols-5">
                {steps.map((step, index) => (
                    <motion.li
                        key={step.title}
                        initial={reducedMotion ? false : { opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{
                            duration: 0.6,
                            delay: index * 0.08,
                            ease: [0.16, 1, 0.3, 1],
                        }}
                        className="border-t border-ink/20 pt-5"
                    >
                        <h3 className="text-lg text-ink">{step.title}</h3>
                        <p className="mt-2 font-sans text-sm leading-relaxed text-ink/65">
                            {step.body}
                        </p>
                    </motion.li>
                ))}
            </ol>
        </section>
    );
}

export default Process;
