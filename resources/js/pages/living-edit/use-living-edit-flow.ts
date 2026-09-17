import { router, usePage } from '@inertiajs/react';
import type { LivingSpace, StepOneOption, StepTwoOption } from '@/types';

/**
 * The steps after choosing a space, in order. Add later steps here
 * and render them in the page.
 */
export const LIVING_EDIT_STEPS = ['step-1', 'step-2'] as const;

export const LIVING_EDIT_TOTAL_STEPS = 4;

export const MAX_STEP_SELECTIONS = 3;

export type LivingEditStep = (typeof LIVING_EDIT_STEPS)[number];

type FlowState = {
    spaceId: string | null;
    step: LivingEditStep | null;
    stepOneIds: string[];
    stepTwoIds: string[];
};

function isStep(value: string | null): value is LivingEditStep {
    return LIVING_EDIT_STEPS.includes(value as LivingEditStep);
}

/** Reads a comma separated list of ids, keeping only known ones. */
function parseIds(value: string | null, options: { id: string }[]): string[] {
    const allowedIds = options.map(({ id }) => id);

    return [...new Set((value ?? '').split(','))]
        .filter((id) => allowedIds.includes(id))
        .slice(0, MAX_STEP_SELECTIONS);
}

/** Adds or removes an id, up to the selection limit. */
function toggleId(ids: string[], id: string): string[] {
    if (ids.includes(id)) {
        return ids.filter((value) => value !== id);
    }

    return ids.length < MAX_STEP_SELECTIONS ? [...ids, id] : ids;
}

function buildUrl({
    spaceId,
    step,
    stepOneIds,
    stepTwoIds,
}: FlowState): string {
    const params = new URLSearchParams();

    if (spaceId) {
        params.set('space', spaceId);
    }

    if (step) {
        params.set('step', step);
    }

    if (stepOneIds.length > 0) {
        params.set('step1', stepOneIds.join(','));
    }

    if (stepTwoIds.length > 0) {
        params.set('step2', stepTwoIds.join(','));
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
    stepOneOptions: StepOneOption[],
    stepTwoOptions: StepTwoOption[],
) {
    const { url } = usePage();
    const params = new URL(url, 'http://localhost').searchParams;

    const space =
        spaces.find(({ id }) => id === params.get('space')) ?? spaces[0];
    const requestedStep = params.get('step');
    const step = space && isStep(requestedStep) ? requestedStep : null;
    const stepOneIds = parseIds(params.get('step1'), stepOneOptions);
    const stepTwoIds = parseIds(params.get('step2'), stepTwoOptions);

    const state: FlowState = {
        spaceId: space?.id ?? null,
        step,
        stepOneIds,
        stepTwoIds,
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
            update({ spaceId, stepOneIds: [], stepTwoIds: [] });
        }
    }

    function toggleStepOne(id: string) {
        update({ stepOneIds: toggleId(stepOneIds, id) });
    }

    function toggleStepTwo(id: string) {
        update({ stepTwoIds: toggleId(stepTwoIds, id) });
    }

    return {
        space,
        step,
        stepOneIds,
        stepTwoIds,
        goTo,
        selectSpace,
        toggleStepOne,
        toggleStepTwo,
    };
}
