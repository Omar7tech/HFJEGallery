import { cn } from '@/lib/utils';

type LogoProps = {
    className?: string;
    /** Render in white for use on the brand-colored bar / dark footer. */
    invert?: boolean;
    /**
     * Logo height. A number is treated as pixels; a string is used as-is
     * (e.g. '3rem', '48px'). Defaults to '1em' so it scales with font-size.
     */
    size?: number | string;
};

/**
 * HFJE letterform paths with their hover stagger delay, so the color flip
 * ripples left to right: H, FJ, E, then the ® mark.
 */
const glyphs: { d: string; delayMs: number }[] = [
    {
        d: 'M363.16,0v314.14h-37.13v-89.02c0-30.82-24.81-55.88-55.28-55.88H37.13v144.9H0V0h37.13v78.05c0,33.22,26.79,60.28,59.68,60.28h229.21V0h37.13Z',
        delayMs: 0,
    },
    {
        d: 'M664.21,0v241.05c0,24.42-5.59,42.95-16.64,55-11.06,12.01-30.63,18.09-58.17,18.09h-94.28v-30.9h94.28c13.35,0,23.06-2.6,28.89-7.77,5.9-5.24,8.76-16.53,8.76-34.42V30.94h-208.41v107.39h174.48v30.9h-140.05c-18.98,0-34.44,15.61-34.44,34.78v110.12h-37.13V94.59c0-52.16,42.01-94.59,93.64-94.59h189.07Z',
        delayMs: 60,
    },
    {
        d: 'M1077.96,283.24v30.9h-289.23c-54.49,0-98.79-44.75-98.79-99.75V0h305.34v30.94h-268.17v107.39h256.95v30.9h-256.95v114h350.86Z',
        delayMs: 120,
    },
    {
        d: 'M1042.32,0c5.26,0,9.78,1.9,13.55,5.71,3.78,3.81,5.67,8.38,5.67,13.73s-1.88,9.93-5.64,13.74c-3.76,3.81-8.29,5.72-13.58,5.72s-9.85-1.9-13.63-5.71c-3.78-3.81-5.67-8.39-5.67-13.75s1.89-9.94,5.68-13.74c3.79-3.8,8.32-5.7,13.62-5.7ZM1042.27,35.7c4.41,0,8.19-1.59,11.34-4.78,3.16-3.19,4.73-7.02,4.73-11.49s-1.57-8.29-4.72-11.46c-3.15-3.17-6.93-4.76-11.36-4.76s-8.2,1.59-11.34,4.76-4.71,6.99-4.71,11.46,1.57,8.3,4.71,11.49c3.14,3.19,6.92,4.78,11.34,4.78ZM1050.94,30.21h-3.83l-1.61-4.56c-.97-2.73-2.8-4.1-5.49-4.1h-2.63v8.66h-3.34V9.31h7.78c5.48,0,8.22,1.92,8.22,5.75s-1.79,5.68-5.38,5.95c1.84.57,3.2,1.89,4.08,3.97l2.19,5.23ZM1037.39,18.64h4.19c3.28,0,4.93-1.09,4.93-3.27s-1.69-3.22-5.08-3.22h-4.03v6.5Z',
        delayMs: 180,
    },
];

/**
 * HFJE wordmark. Inlined so it inherits the current text color (`fill-current`)
 * and its size can be controlled via the `size` prop (or font-size when `size`
 * is omitted).
 *
 * On hover the letters flip color in a quick left-to-right ripple: to brand
 * terracotta on light backgrounds, to cream when inverted on the brand bar.
 */
export default function Logo({
    className,
    invert = false,
    size = '1em',
}: LogoProps) {
    const height = typeof size === 'number' ? `${size}px` : size;

    return (
        <svg
            viewBox="0 0 1077.96 314.14"
            role="img"
            aria-label="HFJE"
            style={{ height }}
            className={cn(
                'group w-auto fill-current',
                invert ? 'text-white' : 'text-ink',
                className,
            )}
        >
            {glyphs.map((glyph) => (
                <path
                    key={glyph.d}
                    d={glyph.d}
                    style={{ transitionDelay: `${glyph.delayMs}ms` }}
                    className={cn(
                        'transition-[fill] duration-150 ease-out motion-reduce:transition-none',
                        invert
                            ? 'group-hover:fill-cream'
                            : 'group-hover:fill-brand',
                    )}
                />
            ))}
        </svg>
    );
}
