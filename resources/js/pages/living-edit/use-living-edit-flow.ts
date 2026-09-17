import { router, usePage } from '@inertiajs/react';
import type { LivingEditOption, LivingSpace } from '@/types';

/**
 * The steps after choosing a space, in order, with the query string key
 * that holds each step's selections.
 */
export const LIVING_EDIT_STEP_PARAMS = {
    'step-1': 'step1',
    'step-2': 'step2',
    'step-3': 'step3',
    'step-4': 'step4',
} as const;

export type LivingEditStep = keyof typeof LIVING_EDIT_STEP_PARAMS;

export const LIVING_EDIT_STEPS = Object.keys(
    LIVING_EDIT_STEP_PARAMS,
) as LivingEditStep[];

export const LIVING_EDIT_TOTAL_STEPS = LIVING_EDIT_STEPS.length;

export const MAX_STEP_SELECTIONS = 3;

export type LivingEditSelections = Record<LivingEditStep, string[]>;

export type LivingEditOptions = Record<LivingEditStep, LivingEditOption[]>;

type FlowState = {
    spaceId: string | null;
    step: LivingEditStep | null;
    selections: LivingEditSelections;
};

const NO_SELECTIONS: LivingEditSelections = {
    'step-1': [],
    'step-2': [],
    'step-3': [],
    'step-4': [],
};

function isStep(value: string | null): value is LivingEditStep {
    return LIVING_EDIT_STEPS.includes(value as LivingEditStep);
}

/** Reads a comma separated list of ids, keeping only known ones. */
function parseIds(value: string | null, options: LivingEditOption[]): string[] {
    const allowedIds = options.map(({ id }) => id);

    return [...new Set((value ?? '').split(','))]
        .filter((id) => allowedIds.includes(id))
        .slice(0, MAX_STEP_SELECTIONS);
}

function buildUrl({ spaceId, step, selections }: FlowState): string {
    const params = new URLSearchParams();

    if (spaceId) {
        params.set('space', spaceId);
    }

    if (step) {
        params.set('step', step);
    }

    for (const key of LIVING_EDIT_STEPS) {
        if (selections[key].length > 0) {
            params.set(LIVING_EDIT_STEP_PARAMS[key], selections[key].join(','));
        }
    }

    const query = params.toString().replaceAll('%2C', ',');

    return query ? `/living-edit?${query}` : '/living-edit';
}

/**
 * Keeps the Living Edit selections in the query string, so browser back/forward
 * and refresh land on the same step. Navigation is client side only: no server requests.
 */
export function useLivingEditFlow(
    spaces: LivingSpace[],
    options: LivingEditOptions,
) {
    const { url } = usePage();
    const params = new URL(url, 'http://localhost').searchParams;

    const space =
        spaces.find(({ id }) => id === params.get('space')) ?? spaces[0];
    const requestedStep = params.get('step');
    const step = space && isStep(requestedStep) ? requestedStep : null;
    const selections = Object.fromEntries(
        LIVING_EDIT_STEPS.map((key) => [
            key,
            parseIds(params.get(LIVING_EDIT_STEP_PARAMS[key]), options[key]),
        ]),
    ) as LivingEditSelections;

    const state: FlowState = {
        spaceId: space?.id ?? null,
        step,
        selections,
    };

    /** Moves to another step and adds a browser history entry. */
    function goTo(nextStep: LivingEditStep | null) {
        router.push({
            url: buildUrl({ ...state, step: nextStep }),
            preserveState: true,
        });
    }

    /** Updates a selection in place, without adding a history entry. */
    function update(changes: Partial<FlowState>) {
        router.replace({
            url: buildUrl({ ...state, ...changes }),
            preserveState: true,
            preserveScroll: true,
        });
    }

    function selectSpace(spaceId: string) {
        if (spaceId !== state.spaceId) {
            update({ spaceId, selections: NO_SELECTIONS });
        }
    }

    /** Adds or removes an option of a step, up to the selection limit. */
    function toggleOption(key: LivingEditStep, id: string) {
        const ids = selections[key];

        if (ids.includes(id)) {
            update({
                selections: {
                    ...selections,
                    [key]: ids.filter((value) => value !== id),
                },
            });
        } else if (ids.length < MAX_STEP_SELECTIONS) {
            update({ selections: { ...selections, [key]: [...ids, id] } });
        }
    }

    return {
        space,
        step,
        selections,
        goTo,
        selectSpace,
        toggleOption,
    };
}
