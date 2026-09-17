import { useEffect, useRef, useState } from 'react';
import type { MoodBoardSlot } from '@/types';
import {
    LIVING_EDIT_STEP_PARAMS,
    LIVING_EDIT_STEPS,
} from './use-living-edit-flow';
import type { LivingEditSelections } from './use-living-edit-flow';

const ENDPOINT = '/living-edit/mood-board';

/**
 * - empty: no board shown yet
 * - loading: a board is being built
 * - ready: the board matches the current choices
 * - stale: the choices changed since the board was built
 * - failed: the last request did not succeed
 */
export type MoodBoardStatus =
    'empty' | 'loading' | 'ready' | 'stale' | 'failed';

type Board = {
    spaceId: string;
    choices: string;
    seed: number;
    slots: MoodBoardSlot[];
};

/**
 * The choices as a query string. Slugs are sorted, so picking the same options in another
 * order does not count as a change.
 */
function choicesQuery(
    spaceId: string,
    selections: LivingEditSelections,
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

    return params.toString();
}

/**
 * The mood board of a space. Nothing loads on its own: the visitor asks for the board, and once
 * shown it stays on screen, marked as stale when their choices change.
 */
export function useMoodBoard(
    spaceId: string | null,
    selections: LivingEditSelections,
) {
    const [board, setBoard] = useState<Board | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [hasFailed, setHasFailed] = useState(false);
    const requestRef = useRef<AbortController | null>(null);

    const choices = spaceId ? choicesQuery(spaceId, selections) : null;
    const spaceBoard = board && board.spaceId === spaceId ? board : null;
    const isStale = spaceBoard !== null && spaceBoard.choices !== choices;

    useEffect(() => () => requestRef.current?.abort(), []);

    async function load(seed: number, keptImageIds: number[]) {
        if (!spaceId || !choices) {
            return;
        }

        requestRef.current?.abort();
        const controller = new AbortController();
        requestRef.current = controller;

        const params = new URLSearchParams(choices);

        if (seed > 0) {
            params.set('seed', String(seed));
        }

        for (const id of keptImageIds) {
            params.append('keep[]', String(id));
        }

        setIsLoading(true);
        setHasFailed(false);

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

            setBoard({ spaceId, choices, seed, slots });
        } catch {
            if (!controller.signal.aborted) {
                setHasFailed(true);
            }
        } finally {
            if (requestRef.current === controller) {
                requestRef.current = null;
                setIsLoading(false);
            }
        }
    }

    /**
     * Shows the board for the current choices. An existing board keeps the images that still
     * match best, so updating changes as little as needed.
     */
    function show() {
        void load(
            spaceBoard?.seed ?? 0,
            spaceBoard?.slots.flatMap(({ image }) =>
                image ? [image.id] : [],
            ) ?? [],
        );
    }

    /** Swaps in other images that match the same choices equally well. */
    function shuffle() {
        void load((spaceBoard?.seed ?? 0) + 1, []);
    }

    const status: MoodBoardStatus = isLoading
        ? 'loading'
        : hasFailed
          ? 'failed'
          : spaceBoard === null
            ? 'empty'
            : isStale
              ? 'stale'
              : 'ready';

    return {
        slots: spaceBoard?.slots ?? null,
        status,
        show,
        shuffle,
    };
}
