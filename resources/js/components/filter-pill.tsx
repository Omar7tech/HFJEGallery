import type { ReactNode } from 'react';
import { useRef } from 'react';
import { cn, isPlainClick } from '@/lib/utils';

interface FilterPillProps {
    href: string;
    active: boolean;
    /** Switch the page to this filter. */
    onSelect: () => void;
    /** Warm the cache for this filter before it is picked. */
    onPrefetch: () => void;
    className?: string;
    children: ReactNode;
}

/** Hover this long before prefetching, as Inertia's own links do. */
const HOVER_DELAY = 75;

/**
 * A pill narrowing a listing to one filter. A real link, so it opens in a new
 * tab too, but a plain click swaps the listing in place. It prefetches on
 * hover, on keyboard focus and on press, so the tap lands on a warm cache.
 */
export default function FilterPill({
    href,
    active,
    onSelect,
    onPrefetch,
    className,
    children,
}: FilterPillProps) {
    const hover = useRef<ReturnType<typeof setTimeout>>(undefined);

    return (
        <a
            href={href}
            aria-current={active ? 'true' : undefined}
            onPointerEnter={(event) => {
                if (event.pointerType === 'mouse') {
                    hover.current = setTimeout(onPrefetch, HOVER_DELAY);
                }
            }}
            onPointerLeave={() => clearTimeout(hover.current)}
            onPointerDown={onPrefetch}
            onFocus={onPrefetch}
            onClick={(event) => {
                if (isPlainClick(event)) {
                    event.preventDefault();
                    onSelect();
                }
            }}
            className={cn(
                'inline-flex h-10 shrink-0 items-center rounded-full border px-4 font-sans text-sm whitespace-nowrap transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand motion-reduce:transition-none @lg:px-5 @lg:text-[15px]',
                active
                    ? 'border-brand bg-brand text-brand-foreground'
                    : 'border-ink/15 text-ink/70 hover:border-ink/40 hover:text-ink',
                className,
            )}
        >
            {children}
        </a>
    );
}
