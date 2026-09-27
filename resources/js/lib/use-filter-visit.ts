import { progress, router } from '@inertiajs/react';
import { useRef, useState } from 'react';

interface FilterVisitOptions {
    /** The value the page is showing now, or null for "all". */
    active: string | null;
    /** The page prop that carries `active`, read back from each response. */
    activeProp: string;
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
    activeProp,
    href,
    only,
    reset,
}: FilterVisitOptions) {
    // The value picked, held until the page's own `active` catches up with
    // it. Never cleared on a timer or a callback alone: a cached response can
    // finish a beat before its props are on screen, and letting go early
    // flashes the previous value.
    const [pending, setPending] = useState<string | null | undefined>();
    const [seenActive, setSeenActive] = useState(active);
    // Only the latest pick may settle the state; an older, cancelled visit
    // must not undo a newer one.
    const latestVisit = useRef(0);

    // The page moved on (the picked value landed, or history went back):
    // nothing is pending any more.
    if (active !== seenActive) {
        setSeenActive(active);
        setPending(undefined);
    }

    const loading = pending !== undefined && pending !== active;
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

        const visit = ++latestVisit.current;
        const settle = (next: string | null | undefined) => {
            if (visit === latestVisit.current) {
                setPending(next);
            }
        };

        const url = href(value);
        // Tapped while its prefetch is still on the way (pressing the pill
        // starts one), Inertia reuses that request but forces the top bar
        // into view, whatever `showProgress` says. Hand it back to hidden
        // for this visit only, balanced so the rest of the site keeps its bar.
        const reusesPrefetch =
            router.getPrefetching(url, { method: 'get', ...options }) !== null;
        const restoreProgress = () => {
            if (reusesPrefetch) {
                progress.reveal();
            }
        };

        setPending(value);
        router.get(
            url,
            {},
            {
                ...options,
                // The server may answer with a different value than asked
                // for (an unknown filter falls back); wait for that one.
                onSuccess: (page) =>
                    settle((page.props[activeProp] as string | null) ?? null),
                onError: () => settle(undefined),
                onCancel: () => settle(undefined),
                onFinish: restoreProgress,
            },
        );

        if (reusesPrefetch) {
            progress.hide();
        }
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
