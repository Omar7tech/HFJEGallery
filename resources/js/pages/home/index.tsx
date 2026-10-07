import { Head } from '@inertiajs/react';
import type { LivingSpace } from '@/types';
import Bayte from './sections/bayte';
import type { BayteHomeProduct } from './sections/bayte';
import Curtains from './sections/curtains';
import Experience from './sections/experience';
import FeaturedProjects from './sections/featured-projects';
import Hero from './sections/hero';
import LivingEdit from './sections/living-edit';

export default function Home({
    bayteProducts,
    livingSpaces,
}: {
    bayteProducts: BayteHomeProduct[];
    livingSpaces: LivingSpace[];
}) {
    return (
        <>
            <Head>
                <link
                    rel="preload"
                    as="image"
                    href="/images/hero-day.webp"
                    fetchPriority="high"
                />
            </Head>
            <Hero />
            <Experience />
            <FeaturedProjects />
            <LivingEdit spaces={livingSpaces} />
            <Curtains />
            <Bayte products={bayteProducts} />
        </>
    );
}
