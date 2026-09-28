import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface MarqueeTextProps {
    children: string;
    className?: string;
    /** Scroll speed in pixels per second. */
    speed?: number;
    /** On phones, wrap onto more lines instead of looping. */
    wrapOnPhones?: boolean;
}

/**
 * Single-line text that loops horizontally only when it does not fit.
 * Falls back to a truncated label when the user prefers reduced motion.
 * With `wrapOnPhones`, a phone wraps it instead: the measuring copy wraps
 * too, so it never counts as overflowing there.
 */
export default function MarqueeText({
    children,
    className,
    speed = 24,
    wrapOnPhones = false,
}: MarqueeTextProps) {
    const containerRef = useRef<HTMLSpanElement>(null);
    const textRef = useRef<HTMLSpanElement>(null);
    const [loopWidth, setLoopWidth] = useState<number | null>(null);

    useEffect(() => {
        const container = containerRef.current;
        const text = textRef.current;

        if (!container || !text) {
            return;
        }

        const measure = () => {
            setLoopWidth(
                text.scrollWidth > container.clientWidth + 1
                    ? text.scrollWidth
                    : null,
            );
        };

        const observer = new ResizeObserver(measure);
        observer.observe(container);
        measure();

        return () => observer.disconnect();
    }, [children]);

    const isLooping = loopWidth !== null;

    return (
        <span
            ref={containerRef}
            className={cn(
                // The clip (and the edge fade) would shave off descenders like
                // "y" and "g", so the box gets breathing room above and below,
                // cancelled by an equal negative margin to keep the layout.
                'relative -my-[0.2em] block overflow-hidden py-[0.2em] whitespace-nowrap',
                wrapOnPhones && 'max-md:text-balance max-md:whitespace-normal',
                isLooping &&
                    'motion-safe:[mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]',
                className,
            )}
        >
            {/* Hidden copy used only to measure the natural text width. */}
            <span
                ref={textRef}
                aria-hidden="true"
                className="invisible absolute top-0 left-0"
            >
                {children}
            </span>

            {isLooping ? (
                <>
                    <span className="sr-only">{children}</span>
                    <span
                        aria-hidden="true"
                        className="block truncate motion-safe:hidden"
                    >
                        {children}
                    </span>
                    <span
                        aria-hidden="true"
                        className="hidden w-max motion-safe:flex motion-safe:animate-marquee"
                        style={{
                            animationDuration: `${loopWidth / speed}s`,
                        }}
                    >
                        <span className="pr-[1.5em]">{children}</span>
                        <span className="pr-[1.5em]">{children}</span>
                    </span>
                </>
            ) : (
                <span className="block">{children}</span>
            )}
        </span>
    );
}
