import { useGSAP } from '@gsap/react';
import { Link, usePage } from '@inertiajs/react';
import { gsap } from 'gsap';
import { useEffect, useRef, useState } from 'react';
import BrandFooterLogo from '@/components/brand-footer-logo';
import Logo from '@/components/logo';
import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP);

type NavItem = {
    label: string;
    href: string;
    /** Always rendered in the brand color (featured item). */
    accent?: boolean;
    /**
     * Sub-pages rendered as a group under the item. Static for now, but will
     * come from the backend with an unknown count — keep layouts flexible.
     */
    children?: { label: string; href: string }[];
};

const navItems: NavItem[] = [
    { label: 'Home', href: '/' },
    {
        label: 'Work',
        href: '/work',
        children: [
            { label: 'Residential', href: '/work/residential' },
            { label: 'Commercial', href: '/work/commercial' },
            { label: 'Hospitality', href: '/work/hospitality' },
            { label: 'Furniture', href: '/work/furniture' },
            { label: 'Renovation', href: '/work/renovation' },
            { label: 'Renovation', href: '/work/renovation' },
            { label: 'Renovation', href: '/work/renovation' },
            { label: 'Renovation', href: '/work/renovation' },
            { label: 'Renovation', href: '/work/renovation' },
            { label: 'Renovation', href: '/work/renovation' },
            { label: 'Renovation', href: '/work/renovation' },
            { label: 'Renovation', href: '/work/renovation' },
            { label: 'Renovation', href: '/work/renovation' },
            { label: 'Renovation', href: '/work/renovation' },
            { label: 'Renovation', href: '/work/renovation' },
            { label: 'Renovation', href: '/work/renovation' },
            { label: 'Renovation', href: '/work/renovation' },
            { label: 'Renovation', href: '/work/renovation' },
        ],
    },
    { label: 'BAYTÉ', href: '/bayte' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
];

/** Above this many sub-links, the group becomes a capped scroll area instead
 *  of pushing the rest of the nav around. Dynamic counts stay contained. */
const SUBLINKS_SCROLL_THRESHOLD = 4;

function isActive(currentUrl: string, href: string): boolean {
    return href === '/' ? currentUrl === '/' : currentUrl.startsWith(href);
}

function NavLinks({
    currentUrl,
    onNavigate,
}: {
    currentUrl: string;
    onNavigate?: () => void;
}) {
    return (
        <nav className="flex flex-col gap-3">
            {navItems.map((item) => (
                <div key={item.label} className="flex flex-col">
                    <Link
                        href={item.href}
                        onClick={onNavigate}
                        className={cn(
                            'w-fit border-b border-ink/30 pt-3 pb-1 font-display text-3xl tracking-tight transition-colors',
                            item.accent || isActive(currentUrl, item.href)
                                ? 'text-brand'
                                : 'text-ink hover:text-brand',
                        )}
                    >
                        {item.label}
                    </Link>
                    {item.children && (
                        <div
                            className={cn(
                                'mt-2 flex flex-col gap-1 border-l border-brand/30 pl-4',
                                item.children.length > SUBLINKS_SCROLL_THRESHOLD &&
                                    'nav-scroll max-h-44 overflow-y-auto pr-2',
                            )}
                        >
                            {item.children.map((child, index) => (
                                <Link
                                    key={`${child.href}-${index}`}
                                    href={child.href}
                                    onClick={onNavigate}
                                    className={cn(
                                        'w-fit shrink-0 font-display text-lg tracking-tight transition-colors',
                                        isActive(currentUrl, child.href)
                                            ? 'text-brand'
                                            : 'text-ink/70 hover:text-brand',
                                    )}
                                >
                                    {child.label}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </nav>
    );
}

function BrandFooter() {
    return <BrandFooterLogo className="max-w-[90%]" />;
}

/**
 * Desktop hero sidebar column: logo, nav and brand footer. Flows in-page
 * (scrolls away with the hero) rather than being fixed.
 */
export function NavSidebar({ className }: { className?: string }) {
    const { url } = usePage();

    return (
        <div className={cn('flex h-full flex-col px-8 py-10', className)}>
            <Link href="/" className="w-fit shrink-0">
                <Logo size={56} />
            </Link>
            {/* Nav sits centered in the space between the logo and footer */}
            <div className="flex min-h-0 flex-1 items-center py-10">
                <NavLinks currentUrl={url} />
            </div>
            <BrandFooter />
        </div>
    );
}

/**
 * Floating terracotta brand bar for small screens: drops in on load and stays
 * pinned while scrolling. The burger opens a clean cream sheet — links rise
 * in with a soft stagger, and Work's categories flow as wrapping tags so any
 * number of them lays out cleanly.
 */
export function NavBar({ className }: { className?: string }) {
    const { url } = usePage();
    const [open, setOpen] = useState(false);
    const hasOpened = useRef(false);
    const barRef = useRef<HTMLElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    const closeMenu = () => setOpen(false);

    // Entrance drop-in; park the sheet hidden before first paint.
    useGSAP(
        () => {
            const reduced = window.matchMedia(
                '(prefers-reduced-motion: reduce)',
            ).matches;

            gsap.set(panelRef.current, { autoAlpha: 0 });

            if (!reduced) {
                gsap.from(barRef.current, {
                    yPercent: -130,
                    duration: 0.7,
                    ease: 'power3.out',
                    delay: 0.15,
                });
            }

            return () => {
                document.documentElement.style.overflow = '';
                document.body.style.overflow = '';
            };
        },
        { scope: barRef },
    );

    // Open / close choreography.
    useGSAP(
        () => {
            const bar = barRef.current!;
            const panel = panelRef.current!;
            const reduced = window.matchMedia(
                '(prefers-reduced-motion: reduce)',
            ).matches;
            const d = (seconds: number) => (reduced ? 0 : seconds);

            const items = panel.querySelectorAll('.menu-item');
            const foot = panel.querySelector('.menu-foot');
            const burgerLines = bar.querySelectorAll('.burger-line');

            if (open) {
                hasOpened.current = true;
                document.documentElement.style.overflow = 'hidden';
                document.body.style.overflow = 'hidden';

                gsap.set(items, { y: 28, autoAlpha: 0 });
                gsap.set(foot, { y: 12, autoAlpha: 0 });

                gsap.timeline()
                    .to(panel, {
                        autoAlpha: 1,
                        duration: d(0.3),
                        ease: 'power1.out',
                    })
                    .to(
                        items,
                        {
                            y: 0,
                            autoAlpha: 1,
                            duration: d(0.55),
                            stagger: d(0.06),
                            ease: 'power3.out',
                        },
                        '-=0.1',
                    )
                    .to(
                        foot,
                        { y: 0, autoAlpha: 1, duration: d(0.4), ease: 'power2.out' },
                        '-=0.35',
                    );

                gsap.to(burgerLines, {
                    rotation: (index) => (index === 0 ? 45 : -45),
                    y: (index) => (index === 0 ? 3.25 : -3.25),
                    duration: d(0.4),
                    ease: 'power3.inOut',
                });
            } else if (hasOpened.current) {
                // Exit is a single quick fade — faster than the enter.
                gsap.to(panel, {
                    autoAlpha: 0,
                    duration: d(0.25),
                    ease: 'power2.in',
                    onComplete: () => {
                        document.documentElement.style.overflow = '';
                        document.body.style.overflow = '';
                    },
                });

                gsap.to(burgerLines, {
                    rotation: 0,
                    y: 0,
                    duration: d(0.4),
                    ease: 'power3.inOut',
                });
            }
        },
        { dependencies: [open] },
    );

    // Escape closes the menu.
    useEffect(() => {
        if (!open) {
            return;
        }

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setOpen(false);
            }
        };
        window.addEventListener('keydown', onKeyDown);

        return () => window.removeEventListener('keydown', onKeyDown);
    }, [open]);

    return (
        <>
            {/* Floating brand bar — stays on top; the sheet lives underneath. */}
            <header
                ref={barRef}
                className={cn(
                    'px-3 pt-[max(0.75rem,env(safe-area-inset-top))]',
                    className,
                )}
            >
                <div className="flex items-center justify-between bg-brand py-2.5 pl-5 pr-2 shadow-[0_10px_30px_rgba(166,94,60,0.3)]">
                    <Link href="/" aria-label="HFJE home" onClick={closeMenu}>
                        <Logo invert size={28} />
                    </Link>
                    <button
                        type="button"
                        aria-label={open ? 'Close menu' : 'Open menu'}
                        aria-expanded={open}
                        onClick={() => setOpen((value) => !value)}
                        className="flex h-11 w-11 touch-manipulation items-center justify-center transition-transform duration-300 active:scale-90 motion-reduce:transition-none"
                    >
                        <span className="flex flex-col gap-[5px]">
                            <span className="burger-line h-[1.5px] w-6 bg-white" />
                            <span className="burger-line h-[1.5px] w-6 bg-white" />
                        </span>
                    </button>
                </div>
            </header>

            {/* Full-screen terracotta sheet */}
            <div
                ref={panelRef}
                aria-hidden={!open}
                className="invisible fixed inset-0 z-[60] flex flex-col overflow-y-auto overscroll-contain bg-brand pt-24 lg:hidden"
            >
                {/* my-auto centers the list when it fits and top-aligns it when
                    a long dynamic Work list makes the sheet scroll. */}
                <nav className="my-auto flex flex-col px-6 py-8">
                    {navItems.map((item) => (
                        <div key={item.label} className="menu-item">
                            <Link
                                href={item.href}
                                onClick={closeMenu}
                                className={cn(
                                    'block w-fit py-2.5 font-display text-4xl tracking-tight',
                                    item.accent || isActive(url, item.href)
                                        ? 'text-white'
                                        : 'text-cream/70',
                                )}
                            >
                                {item.label}
                            </Link>
                            {item.children && (
                                <div
                                    className={cn(
                                        'mt-1 mb-4 flex flex-wrap gap-2',
                                        item.children.length >
                                            SUBLINKS_SCROLL_THRESHOLD &&
                                            'nav-scroll-invert max-h-[20vh] overflow-y-auto overscroll-contain pr-1',
                                    )}
                                >
                                    {item.children.map((child, index) => (
                                        <Link
                                            key={`${child.href}-${index}`}
                                            href={child.href}
                                            onClick={closeMenu}
                                            className={cn(
                                                'border px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.15em]',
                                                isActive(url, child.href)
                                                    ? 'border-cream bg-cream text-brand'
                                                    : 'border-cream/40 text-cream/80',
                                            )}
                                        >
                                            {child.label}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </nav>

                <div className="menu-foot px-6 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
                    <p className="font-display text-xl text-cream">
                        Crafted Around Living.
                    </p>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-cream/60">
                        Home Fashion Jamaleddine
                    </p>
                </div>
            </div>
        </>
    );
}
