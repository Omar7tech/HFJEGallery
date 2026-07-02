import Logo from '@/components/logo';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';

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
    const className = 'text-sm text-white/60 transition-colors hover:text-white';

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
 * page — independent of the sidebar and page content.
 */
export default function SiteFooter({ className }: { className?: string }) {
    const year = new Date().getFullYear();

    return (
        <footer className={cn('bg-ink text-white', className)}>
            <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 sm:px-10 md:grid-cols-[1.5fr_repeat(3,1fr)]">
                <div className="max-w-xs">
                    <Logo invert size={48} />
                    <p className="mt-5 text-sm leading-relaxed text-white/60">
                        Crafting homes designed around the people who live in them.
                    </p>
                </div>

                {columns.map((column) => (
                    <div key={column.title}>
                        <h3 className="font-display text-xs uppercase tracking-[0.2em] text-brand">
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

            <div className="border-t border-white/10">
                <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between sm:px-10">
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
        </footer>
    );
}
