import { InfiniteScroll } from '@inertiajs/react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import type { ReactNode } from 'react';
import { useRef } from 'react';
import { cn } from '@/lib/utils';

interface LoadMoreGridProps {
    /** Name of the `Inertia::scroll()` prop the items come from. */
    data: string;
    /** How many items are shown, to size the loading skeleton. */
    count: number;
    /** Columns and gaps of the grid. */
    className: string;
    /** One placeholder item, repeated while another set loads. */
    skeleton: ReactNode;
    /** Another set of items is on its way: show skeletons instead. */
    loading?: boolean;
    /** The items, one grid cell each. */
    children: ReactNode;
}

/** Placeholders shown while a switch loads: two rows of the widest grid. */
const SKELETON_ITEMS = 6;

/**
 * A grid loaded page by page from an `Inertia::scroll()` prop, behind "Load
 * more" and, when opened on a later page, "Load previous" buttons. While a
 * filter swaps it, the items give way to skeletons of the same shape.
 */
export default function LoadMoreGrid({
    data,
    count,
    className,
    skeleton,
    loading = false,
    children,
}: LoadMoreGridProps) {
    const grid = useRef<HTMLDivElement>(null);

    return (
        <InfiniteScroll
            data={data}
            manual
            itemsElement={grid}
            // Opened on a later page (a refreshed or shared `?page=3`), the
            // earlier pages load back in from above.
            previous={({ loading: fetching, fetch, hasMore }) =>
                hasMore && (
                    <div className="mt-8 flex justify-center">
                        <button
                            type="button"
                            onClick={() => fetch()}
                            disabled={fetching}
                            className="group inline-flex min-h-11 items-center gap-3 rounded-full border border-brand px-10 py-3.5 text-base text-brand transition-colors duration-300 ease-out hover:bg-brand hover:text-brand-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand disabled:opacity-60 motion-reduce:transition-none"
                        >
                            <ArrowUp
                                className={cn(
                                    'size-4 transition-transform duration-300 ease-out group-hover:-translate-y-0.5 motion-reduce:transition-none',
                                    fetching && 'animate-bounce',
                                )}
                                strokeWidth={1.75}
                            />
                            {fetching ? 'Loading…' : 'Load previous'}
                        </button>
                    </div>
                )
            }
            next={({ loading: fetching, fetch, hasMore }) =>
                hasMore && (
                    <div className="mt-12 flex justify-center max-md:mt-8">
                        <button
                            type="button"
                            onClick={() => fetch()}
                            disabled={fetching}
                            className="group inline-flex min-h-11 items-center gap-3 rounded-full bg-brand px-10 py-3.5 text-base text-brand-foreground transition-colors duration-300 ease-out hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand disabled:opacity-60 motion-reduce:transition-none max-md:w-full max-md:justify-center max-md:rounded-xl max-md:text-sm max-md:font-medium"
                        >
                            {fetching ? 'Loading…' : 'Load more'}
                            <ArrowDown
                                className={cn(
                                    'size-4 transition-transform duration-300 ease-out group-hover:translate-y-0.5 motion-reduce:transition-none',
                                    fetching && 'animate-bounce',
                                )}
                                strokeWidth={1.75}
                            />
                        </button>
                    </div>
                )
            }
        >
            {/* Both swaps wait a moment, so a prefetched switch that lands at
                once never flashes the skeletons. */}
            <div className="relative mt-8">
                <div
                    aria-hidden="true"
                    className={cn(
                        'pointer-events-none absolute inset-0 overflow-hidden transition-opacity duration-200 motion-reduce:transition-none',
                        loading ? 'opacity-100 delay-150' : 'opacity-0',
                    )}
                >
                    <div className={className}>
                        {Array.from(
                            { length: Math.min(count, SKELETON_ITEMS) },
                            (_, index) => (
                                <div key={index}>{skeleton}</div>
                            ),
                        )}
                    </div>
                </div>
                <div
                    ref={grid}
                    aria-busy={loading}
                    className={cn(
                        className,
                        'transition-opacity duration-200 motion-reduce:transition-none',
                        loading && 'pointer-events-none opacity-0 delay-150',
                    )}
                >
                    {children}
                </div>
            </div>
        </InfiniteScroll>
    );
}
