import Logo from '@/components/logo';
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
    const className = 'text-sm text-ink/70 transition-colors hover:text-brand';

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
 * page — independent of the sidebar and page content. Sits on a warm tint to
 * separate it from the page, and closes with an oversized HFJE monogram.
 */
export default function SiteFooter({ className }: { className?: string }) {
    const year = new Date().getFullYear();

    return (
        <footer className={cn('bg-[#f4ede3] text-ink', className)}>
            {/* Brand-tinted hairline marks the top edge of the footer. */}
            <div
                aria-hidden
                className="h-0.5 w-full bg-gradient-to-r from-brand/0 via-brand/50 to-brand/0"
            />

            <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 sm:px-10 md:grid-cols-2 md:gap-16">
                {/* CTA */}
                <div className="max-w-md">
                    <p className="font-display text-2xl leading-snug text-ink sm:text-3xl">
                        Let&rsquo;s craft something around you.
                    </p>
                    <p className="mt-4 text-sm leading-relaxed text-ink/60">
                        Homes designed around the people who live in them.
                    </p>
                    <Link
                        href="/contact"
                        className="group mt-8 inline-flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.2em] text-brand transition-colors hover:text-brand-hover"
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
                            <h3 className="font-display text-xs uppercase tracking-[0.2em] text-ink">
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

            <div className="border-t border-ink/10">
                <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-6 text-xs text-ink/60 sm:flex-row sm:items-center sm:justify-between sm:px-10">
                    <p>© {year} Home Fashion Jamaleddine. All rights reserved.</p>
                    <div className="flex gap-5">
                        <Link href="/privacy" className="transition-colors hover:text-brand">
                            Privacy
                        </Link>
                        <Link href="/terms" className="transition-colors hover:text-brand">
                            Terms
                        </Link>
                    </div>
                </div>
            </div>

            {/* Oversized HFJE monogram spanning the full width — the grand finish. */}
            <div className="overflow-hidden px-6 pb-8 pt-6 sm:px-10 sm:pb-10">
                <Logo size="auto" className="w-full" />
            </div>
        </footer>
    );
}
