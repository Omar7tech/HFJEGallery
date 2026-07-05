import { Head } from '@inertiajs/react';
import Hero from "./sections/hero";
import Experience from "./sections/experience";

export default function Home() {
    return (
        <>
            <Head title="Home" />
            <Hero />
            <Experience />
        </>
    );
}
