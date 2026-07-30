import FooterMonogram from '@/components/footer-monogram';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

type FooterLink = { label: string; href: string; external?: boolean };

const columns: { title: string; links: FooterLink[] }[] = [
    {
        title: 'Explore',
        links: [
            { label: 'Home', href: '/' },
            { label: 'Work', href: '/work' },
            { label: 'BAYTÉ', href: '/bayte' },
            { label: 'About', href: '/about' },
            { label: 'Contact', href: '/contact' },
        ],
    },
    {
        title: 'Studio',
        links: [
            { label: 'Projects', href: '/work' },
            { label: 'Craftsmanship', href: '/about' },
            { label: 'Materials', href: '/about' },
        ],
    },
    {
        title: 'Social',
        links: [
            { label: 'Instagram', href: 'https://instagram.com', external: true },
            { label: 'Pinterest', href: 'https://pinterest.com', external: true },
            { label: 'LinkedIn', href: 'https://linkedin.com', external: true },
        ],
    },
];

function FooterLinkItem({ link }: { link: FooterLink }) {
    const className = 'text-base text-cream/70 transition-colors hover:text-white';

    if (link.external) {
        return (
            <a href={link.href} target="_blank" rel="noreferrer" className={className}>
                {link.label}
            </a>
        );
    }

    return (
        <Link href={link.href} className={className}>
            {link.label}
        </Link>
    );
}

/**
 * Full-width site footer. A normal, in-flow footer reached at the end of the
 * page — independent of the sidebar and page content. Sits on solid brand
 * terracotta to separate it from the page, and closes with an oversized HFJE
 * monogram.
 */
export default function SiteFooter({ className }: { className?: string }) {
    const year = new Date().getFullYear();

    return (
        <footer
            className={cn(
                'flex min-h-dvh flex-col overflow-hidden bg-brand text-cream',
                className,
            )}
        >
            {/* Warm hairline marks the top edge of the footer. */}
            <div
                aria-hidden
                className="h-0.5 w-full bg-gradient-to-r from-cream/0 via-cream/60 to-cream/0"
            />

            <div className="mx-auto grid w-full max-w-7xl gap-12 px-6 pt-16 pb-12 sm:px-10 md:grid-cols-2 md:gap-16">
                {/* CTA */}
                <div className="max-w-md">
                    <p className="font-display text-2xl leading-snug text-white sm:text-3xl">
                        Let&rsquo;s craft something around you.
                    </p>
                    <p className="mt-4 text-sm leading-relaxed text-cream/70">
                        Homes designed around the people who live in them.
                    </p>
                    <Link
                        href="/contact"
                        className="group mt-8 inline-flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:text-cream"
                    >
                        Start a project
                        <ArrowRight
                            className="size-4 transition-transform duration-300 ease-out group-hover:translate-x-1"
                            strokeWidth={2.5}
                        />
                    </Link>
                </div>

                {/* Link columns */}
                <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
                    {columns.map((column) => (
                        <div key={column.title}>
                            <h3 className="font-display text-sm uppercase tracking-[0.2em] text-white">
                                {column.title}
                            </h3>
                            <ul className="mt-4 flex flex-col gap-3">
                                {column.links.map((link) => (
                                    <li key={link.label}>
                                        <FooterLinkItem link={link} />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {/* Flexible spacer pushes the legal bar + monogram to the bottom of
                the full-height footer. */}
            <div className="grow" />

            <div className="border-t border-cream/20">
                <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-6 text-sm text-cream/60 sm:flex-row sm:items-center sm:justify-between sm:px-10">
                    <p>© {year} Home Fashion Jamaleddine. All rights reserved.</p>
                    <div className="flex gap-5">
                        <Link href="/privacy" className="transition-colors hover:text-white">
                            Privacy
                        </Link>
                        <Link href="/terms" className="transition-colors hover:text-white">
                            Terms
                        </Link>
                    </div>
                </div>
            </div>

            {/* Oversized HFJE monogram — draws itself in as the footer appears. */}
            <div className="px-6 pb-8 pt-8 sm:px-10 sm:pb-10">
                <FooterMonogram />
            </div>
        </footer>
    );
}
