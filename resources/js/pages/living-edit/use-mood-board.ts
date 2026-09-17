import { useEffect, useRef, useState } from 'react';
import type { MoodBoardSlot } from '@/types';
import {
    LIVING_EDIT_STEP_PARAMS,
    LIVING_EDIT_STEPS,
} from './use-living-edit-flow';
import type { LivingEditSelections } from './use-living-edit-flow';

const ENDPOINT = '/living-edit/mood-board';

/**
 * - locked: the visitor has not reached the last step yet
 * - loading: a board is being built
 * - ready: the board matches the current choices
 * - stale: the choices changed since the board was built
 * - failed: the board could not be loaded
 */
export type MoodBoardStatus =
    'locked' | 'loading' | 'ready' | 'stale' | 'failed';

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

async function fetchBoard(
    choices: string,
    seed: number,
    keptImageIds: number[],
    signal: AbortSignal,
): Promise<MoodBoardSlot[]> {
    const params = new URLSearchParams(choices);

    if (seed > 0) {
        params.set('seed', String(seed));
    }

    for (const id of keptImageIds) {
        params.append('keep[]', String(id));
    }

    const response = await fetch(`${ENDPOINT}?${params}`, {
        headers: { Accept: 'application/json' },
        signal,
    });

    if (!response.ok) {
        throw new Error(`Mood board request failed (${response.status})`);
    }

    const { slots } = (await response.json()) as { slots: MoodBoardSlot[] };

    return slots;
}

/**
 * The mood board of a space. It is built once the visitor reaches the last step, and after that
 * only when they ask for it: changed choices mark the board as stale instead of replacing it.
 */
export function useMoodBoard(
    spaceId: string | null,
    selections: LivingEditSelections,
    isUnlocked: boolean,
) {
    const [board, setBoard] = useState<Board | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [hasFailed, setHasFailed] = useState(false);
    const requestRef = useRef<AbortController | null>(null);

    const choices = spaceId ? choicesQuery(spaceId, selections) : null;
    const spaceBoard = board && board.spaceId === spaceId ? board : null;
    const isStale = spaceBoard !== null && spaceBoard.choices !== choices;

    /** Loads a board on request, replacing any board request still in flight. */
    async function load(nextSeed: number, keptImageIds: number[]) {
        if (!spaceId || !choices) {
            return;
        }

        requestRef.current?.abort();
        const controller = new AbortController();
        requestRef.current = controller;

        setIsLoading(true);
        setHasFailed(false);

        try {
            const slots = await fetchBoard(
                choices,
                nextSeed,
                keptImageIds,
                controller.signal,
            );

            setBoard({ spaceId, choices, seed: nextSeed, slots });
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
     * Updates a stale board, keeping images that still match best, or shows other matching
     * images when the board is already up to date.
     */
    function refresh() {
        if (!spaceBoard) {
            void load(0, []);

            return;
        }

        if (isStale) {
            void load(
                spaceBoard.seed,
                spaceBoard.slots.flatMap(({ image }) =>
                    image ? [image.id] : [],
                ),
            );

            return;
        }

        void load(spaceBoard.seed + 1, []);
    }

    const needsFirstBoard = isUnlocked && spaceBoard === null && !hasFailed;

    /** The first board is built as soon as the last step is reached. */
    useEffect(() => {
        if (!needsFirstBoard || !spaceId || !choices) {
            return;
        }

        const controller = new AbortController();

        fetchBoard(choices, 0, [], controller.signal)
            .then((slots) => setBoard({ spaceId, choices, seed: 0, slots }))
            .catch(() => {
                if (!controller.signal.aborted) {
                    setHasFailed(true);
                }
            });

        return () => controller.abort();
    }, [needsFirstBoard, spaceId, choices]);

    useEffect(() => () => requestRef.current?.abort(), []);

    const status: MoodBoardStatus = !isUnlocked
        ? 'locked'
        : isLoading || needsFirstBoard
          ? 'loading'
          : hasFailed
            ? 'failed'
            : isStale
              ? 'stale'
              : 'ready';

    return {
        slots: isUnlocked ? (spaceBoard?.slots ?? null) : null,
        status,
        refresh,
    };
}
