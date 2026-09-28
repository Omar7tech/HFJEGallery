import {
    motion,
    useReducedMotion,
    useScroll,
    useTransform,
} from 'motion/react';
import type { MotionValue } from 'motion/react';
import { useRef } from 'react';
import CountUp from '@/components/count-up';
import { yearsOfExperience } from '@/lib/experience';

function Word({
    word,
    index,
    total,
    progress,
}: {
    word: string;
    index: number;
    total: number;
    progress: MotionValue<number>;
}) {
    // Each word takes its turn across the scroll, overlapping the next a little.
    const start = index / total;
    const opacity = useTransform(
        progress,
        [start, start + 1.5 / total],
        [0.18, 1],
    );

    return <motion.span style={{ opacity }}>{word} </motion.span>;
}

/**
 * The studio's promise, read at the pace the visitor scrolls, beside the two
 * figures that back it up.
 */
function Manifesto() {
    const reducedMotion = useReducedMotion();
    const text = useRef<HTMLParagraphElement>(null);
    const { scrollYProgress } = useScroll({
        target: text,
        offset: ['start 0.9', 'end 0.55'],
    });

    const years = yearsOfExperience();
    const words =
        `For ${years} years we have been transforming houses into homes through exceptional craftsmanship, premium materials and design shaped around the people who live in them.`.split(
            ' ',
        );

    const figures = [
        { value: years, label: 'Years of experience' },
        { value: 1000, label: 'Completed projects' },
    ];

    return (
        <section className="@container w-full px-5 py-12 font-display max-md:py-9 md:px-12 md:py-16 lg:pr-16 lg:pl-0">
            <div className="grid gap-10 border-t border-ink/15 pt-10 @4xl:grid-cols-12 @4xl:gap-12 @4xl:pt-14">
                <p
                    ref={text}
                    className="text-[clamp(1.2rem,3cqi,1.9rem)] leading-[1.4] text-ink @4xl:col-span-8"
                >
                    {reducedMotion
                        ? words.join(' ')
                        : words.map((word, index) => (
                              <Word
                                  key={`${word}-${index}`}
                                  word={word}
                                  index={index}
                                  total={words.length}
                                  progress={scrollYProgress}
                              />
                          ))}
                </p>

                <dl className="grid grid-cols-2 gap-6 @4xl:col-span-4 @4xl:grid-cols-1 @4xl:content-start @4xl:gap-8">
                    {figures.map((figure) => (
                        <div
                            key={figure.label}
                            className="flex flex-col-reverse gap-2"
                        >
                            <dt className="font-sans text-sm text-ink/60">
                                {figure.label}
                            </dt>
                            <dd className="text-[clamp(1.75rem,4cqi,2.5rem)] leading-none text-brand">
                                <CountUp
                                    to={figure.value}
                                    duration={2}
                                    separator=","
                                />
                                +
                            </dd>
                        </div>
                    ))}
                </dl>
            </div>
        </section>
    );
}

export default Manifesto;
