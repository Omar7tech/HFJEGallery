import { Head } from '@inertiajs/react';
import Hero from "./sections/hero";
import Experience from "./sections/experience";

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
        </>
    );
}
