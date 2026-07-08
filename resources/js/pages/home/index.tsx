import { Head } from '@inertiajs/react';
import Hero from "./sections/hero";
import Experience from "./sections/experience";
import FeaturedProjects from "./sections/featured-projects";

export default function Home() {
    return (
        <>
            <Head title="Home">
                <link
                    rel="preload"
                    as="image"
                    href="/images/potted-plant-table.webp"
                    fetchPriority="high"
                />
            </Head>
            <Hero />
            <Experience />
            <FeaturedProjects />
        </>
    );
}
