import { router } from '@inertiajs/react';
import { useState } from 'react';
import LivingSpacePicker from '@/components/living-space-picker';
import type { LivingSpace } from '@/types';

/**
 * The Living Edit's first step on the home page: pick a space here, and NEXT
 * carries on in the Living Edit at step one with that space.
 */
function LivingEdit({ spaces }: { spaces: LivingSpace[] }) {
    // The first space is picked to start with, as on the Living Edit page.
    const [spaceId, setSpaceId] = useState(spaces[0]?.id ?? null);

    if (spaces.length === 0) {
        return null;
    }

    return (
        <section className="w-full px-6 py-16 md:px-12 md:py-24 lg:pr-16 lg:pl-0">
            <LivingSpacePicker
                spaces={spaces}
                selectedId={spaceId}
                onSelect={setSpaceId}
                onNext={() =>
                    spaceId &&
                    router.visit(
                        `/living-edit?space=${encodeURIComponent(spaceId)}&step=step-1`,
                    )
                }
                titleAs="h2"
            />
        </section>
    );
}

export default LivingEdit;
