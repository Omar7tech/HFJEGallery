import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

interface PageHeaderProps {
    /** The page one level up, linked above the title. */
    back: { label: string; href: string };
    title: string;
    lead?: string;
}

/** The top of a listing page: a way back, the title and one lead line. */
export default function PageHeader({ back, title, lead }: PageHeaderProps) {
    return (
        <header>
            <Link
                href={back.href}
                className="inline-flex min-h-11 items-center gap-2 font-sans text-sm text-ink/60 transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
                <ArrowLeft className="size-4" strokeWidth={1.75} />
                {back.label}
            </Link>

            <h1 className="mt-4 font-display text-[clamp(1.75rem,5cqi,3.5rem)] leading-[1.1] tracking-[-0.04em] text-ink uppercase max-md:mt-2">
                {title}
            </h1>
            {lead && (
                <p className="mt-3 max-w-xl font-sans text-base leading-relaxed text-ink/70 max-md:mt-2 max-md:text-[15px]">
                    {lead}
                </p>
            )}
        </header>
    );
}
