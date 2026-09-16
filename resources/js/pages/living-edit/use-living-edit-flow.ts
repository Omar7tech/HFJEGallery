import { router, usePage } from '@inertiajs/react';
import type { LivingSpace } from '@/types';

/**
 * The steps after choosing a space, in order. Add later steps here
 * (e.g. 'moments', 'materials') and render them in the page.
 */
export const LIVING_EDIT_STEPS = ['feelings'] as const;

export const LIVING_EDIT_TOTAL_STEPS = 4;

export const MAX_FEELINGS = 3;

export type LivingEditStep = (typeof LIVING_EDIT_STEPS)[number];

type FlowState = {
    spaceId: string | null;
    step: LivingEditStep | null;
    feelingIds: string[];
};

function isStep(value: string | null): value is LivingEditStep {
    return LIVING_EDIT_STEPS.includes(value as LivingEditStep);
}

function buildUrl({ spaceId, step, feelingIds }: FlowState): string {
    const params = new URLSearchParams();

    if (spaceId) {
        params.set('space', spaceId);
    }

    if (step) {
        params.set('step', step);
    }

    if (feelingIds.length > 0) {
        params.set('feelings', feelingIds.join(','));
    }

    const query = params.toString().replaceAll('%2C', ',');

    return query ? `/living-edit?${query}` : '/living-edit';
}

/**
 * Keeps the Living Edit selections in the query string, so browser back/forward
 * and refresh land on the same step. Navigation is client side only: no server requests.
 */
export function useLivingEditFlow(spaces: LivingSpace[]) {
    const { url } = usePage();
    const params = new URL(url, 'http://localhost').searchParams;

    const space =
        spaces.find(({ id }) => id === params.get('space')) ?? spaces[0];
    const requestedStep = params.get('step');
    const step = space && isStep(requestedStep) ? requestedStep : null;
    const allowedFeelingIds = space?.feelings.map(({ id }) => id) ?? [];
    const feelingIds = [...new Set((params.get('feelings') ?? '').split(','))]
        .filter((id) => allowedFeelingIds.includes(id))
        .slice(0, MAX_FEELINGS);

    const state: FlowState = { spaceId: space?.id ?? null, step, feelingIds };

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
            update({ spaceId, feelingIds: [] });
        }
    }

    function toggleFeeling(id: string) {
        if (feelingIds.includes(id)) {
            update({ feelingIds: feelingIds.filter((value) => value !== id) });
        } else if (feelingIds.length < MAX_FEELINGS) {
            update({ feelingIds: [...feelingIds, id] });
        }
    }

    return {
        space,
        step,
        feelingIds,
        goTo,
        selectSpace,
        toggleFeeling,
    };
}
