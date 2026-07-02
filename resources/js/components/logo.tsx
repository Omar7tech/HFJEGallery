import { cn } from '@/lib/utils';

type LogoProps = {
    className?: string;
    /** Render in white for use on the brand-colored mobile bar. */
    invert?: boolean;
};

/**
 * HFJE wordmark. Kept isolated so it can later be swapped for an SVG
 * without touching the layout.
 */
export default function Logo({ className, invert = false }: LogoProps) {
    return (
        <span
            className={cn(
                'font-display text-2xl leading-none tracking-tight select-none',
                invert ? 'text-white' : 'text-ink',
                className,
            )}
        >
            HÆE
            <sup className="ml-0.5 align-super text-[0.4em] tracking-normal">®</sup>
        </span>
    );
}
