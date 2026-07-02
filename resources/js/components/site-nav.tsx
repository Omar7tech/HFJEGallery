import Logo from '@/components/logo';
import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

type NavItem = {
    label: string;
    href: string;
    /** Always rendered in the brand color (featured item). */
    accent?: boolean;
};

const navItems: NavItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Work', href: '/work' },
    { label: 'BAYTÉ', href: '/bayte', accent: true },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
];

function isActive(currentUrl: string, href: string): boolean {
    return href === '/' ? currentUrl === '/' : currentUrl.startsWith(href);
}

function NavLinks({ currentUrl, onNavigate }: { currentUrl: string; onNavigate?: () => void }) {
    return (
        <nav className="flex flex-col gap-3">
            {navItems.map((item) => (
                <Link
                    key={item.label}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                        'w-fit border-b border-ink/30 pt-3 pb-1 text-3xl tracking-tight transition-colors font-display',
                        item.accent || isActive(currentUrl, item.href)
                            ? 'text-brand'
                            : 'text-ink hover:text-brand',
                    )}
                >
                    {item.label}
                </Link>
            ))}
        </nav>
    );
}

function BrandFooter() {
    return (
        <img
            src="/logos/brandfooter.svg"
            alt="Home Fashion Jamaleddine"
            className="max-w-full"
        />
    );
}

/**
 * Desktop hero sidebar column: logo, nav and brand footer. Flows in-page
 * (scrolls away with the hero) rather than being fixed.
 */
export function NavSidebar({ className }: { className?: string }) {
    const { url } = usePage();

    return (
        <div className={cn('flex h-full flex-col justify-between px-8 py-10', className)}>
            <div className="flex flex-col gap-40">
                <Link href="/" className="w-fit">
                    <Logo size={56} />
                </Link>
                <NavLinks currentUrl={url} />
            </div>
            <BrandFooter />
        </div>
    );
}

/**
 * Compact brand bar for small screens: logo + hamburger opening a drawer.
 */
export function NavBar({ className }: { className?: string }) {
    const { url } = usePage();
    const [open, setOpen] = useState(false);

    return (
        <>
            <header
                className={cn(
                    'flex items-center justify-between bg-brand px-4 py-3',
                    className,
                )}
            >
                <Link href="/">
                    <Logo invert size={32} />
                </Link>
                <button
                    type="button"
                    aria-label="Toggle navigation"
                    aria-expanded={open}
                    onClick={() => setOpen((value) => !value)}
                    className="p-2"
                >
                    <span className="block h-0.5 w-6 bg-white" />
                    <span className="mt-1.5 block h-0.5 w-6 bg-white" />
                    <span className="mt-1.5 block h-0.5 w-6 bg-white" />
                </button>
            </header>

            {open && (
                <div className="fixed inset-0 z-50">
                    <div className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
                    <div className="absolute inset-y-0 left-0 flex w-72 max-w-[80%] flex-col justify-between bg-white px-8 py-10 shadow-xl">
                        <div className="flex flex-col gap-14">
                            <Logo size={56} />
                            <NavLinks currentUrl={url} onNavigate={() => setOpen(false)} />
                        </div>
                        <BrandFooter />
                    </div>
                </div>
            )}
        </>
    );
}
