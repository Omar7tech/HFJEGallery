import { useEffect, useEffectEvent, useState } from 'react';
import type { MoodBoardSlot } from '@/types';
import {
    LIVING_EDIT_STEP_PARAMS,
    LIVING_EDIT_STEPS,
} from './use-living-edit-flow';
import type { LivingEditSelections } from './use-living-edit-flow';

const ENDPOINT = '/living-edit/mood-board';

/** Waits for a short pause in clicking before asking for a new board. */
const DEBOUNCE_MS = 200;

type Board = {
    slots: MoodBoardSlot[];
    seed: number;
};

/**
 * The query for a board. Slugs are sorted so the same choices in any order share one cached board.
 */
function boardQuery(
    spaceId: string,
    selections: LivingEditSelections,
    seed: number,
): string {
    const params = new URLSearchParams({ space: spaceId });

    for (const step of LIVING_EDIT_STEPS) {
        if (selections[step].length > 0) {
            params.set(
                LIVING_EDIT_STEP_PARAMS[step],
                [...selections[step]].sort().join(','),
            );
        }
    }

    if (seed > 0) {
        params.set('seed', String(seed));
    }

    return params.toString();
}

/**
 * Loads the mood board for a space and the visitor's choices.
 *
 * Boards are cached per choice, so going back and forth never refetches. While a new board
 * loads, the previous one stays on screen, and images that still match best are kept in place.
 */
export function useMoodBoard(
    spaceId: string | null,
    selections: LivingEditSelections,
) {
    const [seed, setSeed] = useState(0);
    const [boards, setBoards] = useState<Record<string, Board>>({});
    const [lastBoard, setLastBoard] = useState<Board | null>(null);
    const [failedQuery, setFailedQuery] = useState<string | null>(null);

    const query = spaceId ? boardQuery(spaceId, selections, seed) : null;
    const cachedBoard = query ? boards[query] : undefined;
    const board = cachedBoard ?? lastBoard;

    /** Images to keep in place. A refresh asks for a new seed, so nothing is kept then. */
    const keptImageIds = useEffectEvent((): number[] =>
        board && board.seed === seed
            ? board.slots.flatMap(({ image }) => (image ? [image.id] : []))
            : [],
    );

    useEffect(() => {
        if (!query || cachedBoard) {
            return;
        }

        const controller = new AbortController();

        const timer = window.setTimeout(async () => {
            const params = new URLSearchParams(query);

            for (const id of keptImageIds()) {
                params.append('keep[]', String(id));
            }

            try {
                const response = await fetch(`${ENDPOINT}?${params}`, {
                    headers: { Accept: 'application/json' },
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error(
                        `Mood board request failed (${response.status})`,
                    );
                }

                const { slots } = (await response.json()) as {
                    slots: MoodBoardSlot[];
                };
                const loaded = { slots, seed };

                setBoards((current) => ({ ...current, [query]: loaded }));
                setLastBoard(loaded);
            } catch {
                if (!controller.signal.aborted) {
                    setFailedQuery(query);
                }
            }
        }, DEBOUNCE_MS);

        return () => {
            window.clearTimeout(timer);
            controller.abort();
        };
    }, [query, cachedBoard, seed]);

    return {
        slots: board?.slots ?? null,
        isLoading: query !== null && !cachedBoard && failedQuery !== query,
        refresh: () => setSeed((current) => current + 1),
    };
}
