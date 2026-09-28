import { Head } from '@inertiajs/react';
import Closing from './sections/closing';
import Disciplines from './sections/disciplines';
import Intro from './sections/intro';
import Manifesto from './sections/manifesto';
import Process from './sections/process';

export default function About() {
    return (
        <>
            <Head title="About">
                <meta
                    name="description"
                    content="HFJE is a family studio crafting interiors, curtains, textiles and furniture for the people who live with them."
                />
                <link
                    rel="preload"
                    as="image"
                    href="/images/modern-living-room-interior-design-w1600.webp"
                    fetchPriority="high"
                />
            </Head>
            <Intro />
            <Manifesto />
            <Disciplines />
            <Process />
            <Closing />
        </>
    );
}
