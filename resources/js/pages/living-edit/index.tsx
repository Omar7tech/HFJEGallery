import { Head } from '@inertiajs/react';
import LivingSpacePicker from '@/components/living-space-picker';
import type { LivingSpace } from '@/types';
import LivingMoodBoard from './mood-board';
import { LIVING_EDIT_STEPS, useLivingEditFlow } from './use-living-edit-flow';
import type { LivingEditOptions, LivingEditStep } from './use-living-edit-flow';
import { useMoodBoard } from './use-mood-board';

export default function LivingEdit({
    spaces,
    steps,
}: {
    spaces: LivingSpace[];
    steps: LivingEditOptions;
}) {
    const { space, step, selections, goTo, selectSpace, toggleOption } =
        useLivingEditFlow(spaces, steps);
    const board = useMoodBoard(space?.id ?? null, selections);
    const choiceNames = Object.fromEntries(
        LIVING_EDIT_STEPS.map((key) => [
            key,
            selections[key].flatMap((id) => {
                const option = steps[key].find((entry) => entry.id === id);

                return option ? [option.name] : [];
            }),
        ]),
    ) as Record<LivingEditStep, string[]>;

    if (space && step) {
        const stepIndex = LIVING_EDIT_STEPS.indexOf(step);
        const previousStep = LIVING_EDIT_STEPS[stepIndex - 1] ?? null;
        const nextStep = LIVING_EDIT_STEPS[stepIndex + 1];

        return (
            <>
                <Head title="Living Edit" />
                <LivingMoodBoard
                    step={step}
                    space={space}
                    options={steps[step]}
                    selected={selections[step]}
                    onToggle={(id) => toggleOption(step, id)}
                    onBack={() => goTo(previousStep)}
                    onContinue={nextStep ? () => goTo(nextStep) : undefined}
                    isLastStep={!nextStep}
                    choiceNames={choiceNames}
                    board={board}
                />
            </>
        );
    }

    return (
        <>
            <Head title="Living Edit" />

            <section className="w-full px-4 pt-9 pb-4 md:px-8 lg:pt-[52px] lg:pr-7 lg:pl-0">
                <LivingSpacePicker
                    spaces={spaces}
                    selectedId={space?.id ?? null}
                    onSelect={selectSpace}
                    onNext={() => goTo('step-1')}
                />
            </section>
        </>
    );
}
