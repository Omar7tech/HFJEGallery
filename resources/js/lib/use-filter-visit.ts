import { router } from '@inertiajs/react';
import { useState } from 'react';

interface FilterVisitOptions {
    /** The value the page is showing now, or null for "all". */
    active: string | null;
    /** The page narrowed to a value, or to "all" for null. */
    href: (value: string | null) => string;
    /** The props a switch reloads; everything else stays as it is. */
    only: string[];
    /** Infinite-scroll props to start again from their first page. */
    reset: string[];
}

/** How long a prefetched filter stays fresh, then can still be served while it refreshes. */
const CACHE_FOR: [string, string] = ['30s', '2m'];

/**
 * A filter that swaps part of the page in place, the Inertia way: a partial
 * reload of just the filtered props, reset rather than merged, with no top
 * progress bar. The picked value is shown at once, and a value hovered,
 * focused or pressed is prefetched, so the switch itself is usually served
 * straight from the cache.
 */
export function useFilterVisit({
    active,
    href,
    only,
    reset,
}: FilterVisitOptions) {
    // The value picked while its data is still on the way; undefined when
    // nothing is in flight.
    const [pending, setPending] = useState<string | null | undefined>();
    const loading = pending !== undefined;
    const selected = loading ? pending : active;

    // The same options for the prefetch and the visit, so the visit finds
    // the prefetched response.
    const options = {
        only,
        reset,
        preserveState: true,
        preserveScroll: true,
        showProgress: false,
    };

    const select = (value: string | null) => {
        if (value === selected) {
            return;
        }

        setPending(value);
        router.get(
            href(value),
            {},
            { ...options, onFinish: () => setPending(undefined) },
        );
    };

    const prefetch = (value: string | null) => {
        if (value !== active) {
            router.prefetch(
                href(value),
                { method: 'get', ...options },
                { cacheFor: CACHE_FOR },
            );
        }
    };

    return { selected, loading, select, prefetch };
}
