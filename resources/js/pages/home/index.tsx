import { Head } from '@inertiajs/react';
import Hero from "./sections/hero";
import Experience from "./sections/experience";
import FeaturedProjects from "./sections/featured-projects";
import Bayte from "./sections/bayte";


export default function Home() {
    return (
        <>
            <Head title="Home">
                <link
                    rel="preload"
                    as="image"
                    href="/images/potted-plant-table-w2400.webp"
                    fetchPriority="high"
                />
            </Head>
            <Hero />
            <Experience />
            <FeaturedProjects />
            <Bayte />
        </>
    );
}
