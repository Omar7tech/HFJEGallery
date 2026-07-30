import { Head } from '@inertiajs/react';
import Bayte from "./sections/bayte";
import Curtains from "./sections/curtains";
import Experience from "./sections/experience";
import FeaturedProjects from "./sections/featured-projects";
import Hero from "./sections/hero";


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
            <Curtains />
        </>
    );
}
