import { router, usePage } from '@inertiajs/react';
import type { LivingSpace, StepOneOption } from '@/types';

/**
 * The steps after choosing a space, in order. Add later steps here
 * (e.g. 'moments', 'materials') and render them in the page.
 */
export const LIVING_EDIT_STEPS = ['step-1'] as const;

export const LIVING_EDIT_TOTAL_STEPS = 4;

export const MAX_STEP_ONE_SELECTIONS = 3;

export type LivingEditStep = (typeof LIVING_EDIT_STEPS)[number];

type FlowState = {
    spaceId: string | null;
    step: LivingEditStep | null;
    stepOneIds: string[];
};

function isStep(value: string | null): value is LivingEditStep {
    return LIVING_EDIT_STEPS.includes(value as LivingEditStep);
}

function buildUrl({ spaceId, step, stepOneIds }: FlowState): string {
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
) {
    const { url } = usePage();
    const params = new URL(url, 'http://localhost').searchParams;

    const space =
        spaces.find(({ id }) => id === params.get('space')) ?? spaces[0];
    const requestedStep = params.get('step');
    const step = space && isStep(requestedStep) ? requestedStep : null;
    const allowedStepOneIds = stepOneOptions.map(({ id }) => id);
    const stepOneIds = [...new Set((params.get('step1') ?? '').split(','))]
        .filter((id) => allowedStepOneIds.includes(id))
        .slice(0, MAX_STEP_ONE_SELECTIONS);

    const state: FlowState = { spaceId: space?.id ?? null, step, stepOneIds };

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
            update({ spaceId, stepOneIds: [] });
        }
    }

    function toggleStepOne(id: string) {
        if (stepOneIds.includes(id)) {
            update({ stepOneIds: stepOneIds.filter((value) => value !== id) });
        } else if (stepOneIds.length < MAX_STEP_ONE_SELECTIONS) {
            update({ stepOneIds: [...stepOneIds, id] });
        }
    }

    return {
        space,
        step,
        stepOneIds,
        goTo,
        selectSpace,
        toggleStepOne,
    };
}
