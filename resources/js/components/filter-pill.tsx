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
    /** A rounded pill in a row, an underlined tab, or a full-width row in a vertical list. */
    variant?: 'pill' | 'tab' | 'list';
    className?: string;
    children: ReactNode;
}

/** Hover this long before prefetching, as Inertia's own links do. */
const HOVER_DELAY = 75;

const VARIANTS = {
    pill: {
        base: 'h-10 shrink-0 rounded-full border px-4 text-sm whitespace-nowrap @lg:px-5 @lg:text-[15px]',
        active: 'border-brand bg-brand text-brand-foreground',
        idle: 'border-ink/15 text-ink/70 hover:border-ink/40 hover:text-ink',
    },
    tab: {
        base: '-mb-px min-h-11 border-b-2 text-base whitespace-nowrap @lg:text-lg',
        active: 'border-brand text-brand',
        idle: 'border-transparent text-ink/55 hover:text-ink',
    },
    list: {
        base: 'min-h-11 w-full justify-between gap-3 rounded-2xl px-3.5 text-[15px]',
        active: 'bg-brand/10 font-medium text-brand',
        idle: 'text-ink/75 hover:bg-surface hover:text-ink',
    },
};

/**
 * A filter narrowing a listing, as a pill or a list row. A real link, so it opens in a new
 * tab too, but a plain click swaps the listing in place. It prefetches on
 * hover, on keyboard focus and on press, so the tap lands on a warm cache.
 */
export default function FilterPill({
    href,
    active,
    onSelect,
    onPrefetch,
    variant = 'pill',
    className,
    children,
}: FilterPillProps) {
    const look = VARIANTS[variant];
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
                'inline-flex items-center font-sans transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand motion-reduce:transition-none',
                look.base,
                active ? look.active : look.idle,
                className,
            )}
        >
            {children}
        </a>
    );
}
