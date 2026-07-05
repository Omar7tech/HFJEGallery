import { glyphs } from '@/components/logo';
import { cn } from '@/lib/utils';
import { motion, useReducedMotion, type Variants } from 'motion/react';

/** Resting opacity of the filled monogram — a soft watermark, not solid ink. */
const FILL_OPACITY = 0.14;

const container: Variants = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.18, delayChildren: 0.1 },
    },
};

/**
 * Each glyph draws its outline in, then the fill softly fades up just after the
 * stroke lands — a signature-style reveal.
 */
const glyph: Variants = {
    hidden: { pathLength: 0, fillOpacity: 0 },
    visible: {
        pathLength: 1,
        fillOpacity: FILL_OPACITY,
        transition: {
            pathLength: { duration: 0.9, ease: [0.4, 0, 0.2, 1] },
            fillOpacity: { duration: 0.6, delay: 0.7, ease: 'easeOut' },
        },
    },
};

/**
 * Oversized HFJE monogram for the footer. On scroll into view the letterforms
 * draw themselves left-to-right and then fill to a faint watermark; it replays
 * each time the footer re-enters the viewport. Falls back to the static
 * watermark when the user prefers reduced motion.
 */
export default function FooterMonogram({ className }: { className?: string }) {
    const reduceMotion = useReducedMotion();

    return (
        <motion.svg
            viewBox="0 0 1077.96 314.14"
            role="img"
            aria-label="HFJE"
            className={cn('h-auto w-full overflow-visible fill-ink stroke-ink/40', className)}
            variants={reduceMotion ? undefined : container}
            initial={reduceMotion ? false : 'hidden'}
            whileInView={reduceMotion ? undefined : 'visible'}
            viewport={{ once: true, amount: 0.35 }}
        >
            {glyphs.map((letter) => (
                <motion.path
                    key={letter.d}
                    d={letter.d}
                    strokeWidth={1.5}
                    vectorEffect="non-scaling-stroke"
                    variants={reduceMotion ? undefined : glyph}
                    style={reduceMotion ? { fillOpacity: FILL_OPACITY } : undefined}
                />
            ))}
        </motion.svg>
    );
}
