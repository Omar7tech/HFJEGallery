import { useGSAP } from '@gsap/react';
import { Link, router, usePage } from '@inertiajs/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight } from 'lucide-react';
import type { MouseEvent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import BrandFooterLogo from '@/components/brand-footer-logo';
import Logo from '@/components/logo';
import { cn, isPlainClick } from '@/lib/utils';

gsap.registerPlugin(useGSAP, ScrollTrigger);

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
    },
    { label: 'Curtains', href: '/curtains' },
    { label: 'BAYTÉ', href: '/bayte' },
    { label: 'Living Edit', href: '/living-edit' },
    { label: 'About', href: '/about' },
];

/** Above this many sub-links, the group becomes a capped scroll area instead
 * of pushing the rest of the nav around. Dynamic counts stay contained. */
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
        <nav className="flex flex-col gap-[clamp(0.25rem,0.9vh,0.5rem)]">
            {navItems.map((item) => (
                <div key={item.label} className="flex flex-col">
                    <Link
                        href={item.href}
                        onClick={onNavigate}
                        className={cn(
                            'w-fit border-b border-ink/30 pt-[clamp(0.25rem,0.9vh,0.5rem)] pb-1 font-display text-[clamp(1.25rem,3.2vh,1.75rem)] tracking-tight transition-colors',
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
                                item.children.length >
                                    SUBLINKS_SCROLL_THRESHOLD &&
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
        <div
            className={cn(
                'flex h-full flex-col px-6 py-[clamp(1.25rem,4vh,2.5rem)]',
                className,
            )}
        >
            <Link href="/" className="w-fit shrink-0">
                <Logo size={48} />
            </Link>
            {/* Nav centers between logo and footer, but scrolls on its own when
                the viewport is too short to fit it — `my-auto` centers while
                still allowing scroll to the top (unlike justify/items-center). */}
            <div className="nav-scroll flex min-h-0 flex-1 flex-col overflow-y-auto py-[clamp(0.75rem,3vh,1.5rem)]">
                <div className="my-auto">
                    <NavLinks currentUrl={url} />
                </div>
            </div>
            <div className="shrink-0">
                <BrandFooter />
            </div>
        </div>
    );
}

/** Folds of a drawn curtain: soft light and shadow bands across the panel. */
const PLEATS =
    'repeating-linear-gradient(90deg, rgb(0 0 0 / 0.07) 0px, rgb(255 255 255 / 0.05) 22px, rgb(0 0 0 / 0.07) 44px)';

function lockScroll(): void {
    const html = document.documentElement;
    const gap = window.innerWidth - html.clientWidth;
    html.style.overflow = 'hidden';
    html.style.paddingRight = gap ? `${gap}px` : '';
}

function unlockScroll(): void {
    document.documentElement.style.overflow = '';
    document.documentElement.style.paddingRight = '';
}

/**
 * The phone and tablet navigation.
 *
 * Closed, it is a slim frosted bar: the logo, a thread of terracotta that
 * fills with the scroll, and a MENU pill. It slips away while reading down
 * the page and comes back the moment you scroll up.
 *
 * Open, the menu is drawn like a pair of curtains: two pleated terracotta
 * panels sweep in from either side and meet in the middle, then the pages
 * rise out of their lines one by one. Picking a page loads it behind the
 * closed curtains, which then draw open onto it.
 *
 * Built on the native modal `<dialog>`, so focus stays inside and Escape
 * closes it; reduced motion swaps the choreography for a plain fade.
 */
export function NavBar({ className }: { className?: string }) {
    const { url, props } = usePage();
    const { contact, socials } = props;
    const barRef = useRef<HTMLElement>(null);
    const progressRef = useRef<HTMLSpanElement>(null);
    const dialogRef = useRef<HTMLDialogElement>(null);
    const toggleRef = useRef<HTMLButtonElement>(null);
    const closeRef = useRef<HTMLButtonElement>(null);
    const timeline = useRef<gsap.core.Timeline | null>(null);
    const [open, setOpen] = useState(false);
    // The page picked in the menu, while it loads behind the curtains.
    const [leavingFor, setLeavingFor] = useState<string | null>(null);

    // The bar drops in on arrival, then follows the scroll: its thread
    // fills with the progress down the page, and it hides while scrolling
    // down and returns on the way back up.
    useGSAP(
        () => {
            const bar = barRef.current!;
            const reduced = window.matchMedia(
                '(prefers-reduced-motion: reduce)',
            ).matches;

            if (!reduced) {
                gsap.from(bar, {
                    yPercent: -140,
                    duration: 0.8,
                    delay: 0.15,
                    ease: 'expo.out',
                });
            }

            const fill = progressRef.current!;
            gsap.set(fill, { transformOrigin: 'left center' });
            const setProgress = gsap.quickSetter(fill, 'scaleX');
            let hidden = false;

            const trigger = ScrollTrigger.create({
                start: 0,
                end: 'max',
                onUpdate: (self) => {
                    setProgress(self.progress);

                    const hide = self.direction === 1 && self.scroll() > 120;

                    if (hide !== hidden) {
                        hidden = hide;
                        gsap.to(bar, {
                            yPercent: hide ? -140 : 0,
                            duration: reduced ? 0 : 0.5,
                            ease: 'expo.out',
                            overwrite: true,
                        });
                    }
                },
            });
            setProgress(trigger.progress);
        },
        { scope: barRef, dependencies: [url] },
    );

    // The curtain choreography, built once and played both ways.
    useGSAP(
        () => {
            const media = gsap.matchMedia();

            media.add(
                {
                    motion: '(prefers-reduced-motion: no-preference)',
                    reduced: '(prefers-reduced-motion: reduce)',
                },
                (context) => {
                    const tl = gsap.timeline({
                        paused: true,
                        defaults: { ease: 'expo.inOut' },
                    });

                    if (context.conditions?.reduced) {
                        tl.fromTo(
                            '.menu-panel, .menu-inner',
                            { autoAlpha: 0 },
                            { autoAlpha: 1, duration: 0.2, ease: 'none' },
                        );
                    } else {
                        tl.fromTo(
                            '.menu-panel-left',
                            { xPercent: -100 },
                            { xPercent: 0, duration: 0.9 },
                        )
                            .fromTo(
                                '.menu-panel-right',
                                { xPercent: 100 },
                                { xPercent: 0, duration: 0.9 },
                                '<0.05',
                            )
                            .fromTo(
                                '.menu-bar',
                                { autoAlpha: 0, y: -12 },
                                {
                                    autoAlpha: 1,
                                    y: 0,
                                    duration: 0.5,
                                    ease: 'power3.out',
                                },
                                '-=0.35',
                            )
                            .fromTo(
                                '.menu-label',
                                { yPercent: 115 },
                                {
                                    yPercent: 0,
                                    duration: 1,
                                    stagger: 0.07,
                                    ease: 'expo.out',
                                },
                                '<-0.05',
                            )
                            .fromTo(
                                '.menu-index, .menu-arrow',
                                { autoAlpha: 0, y: 12 },
                                {
                                    autoAlpha: 1,
                                    y: 0,
                                    duration: 0.6,
                                    stagger: 0.04,
                                    ease: 'power3.out',
                                },
                                '<0.15',
                            )
                            .fromTo(
                                '.menu-rule',
                                { scaleX: 0 },
                                {
                                    scaleX: 1,
                                    duration: 1,
                                    stagger: 0.07,
                                    ease: 'expo.out',
                                },
                                '<-0.2',
                            )
                            .fromTo(
                                '.menu-footer > *',
                                { autoAlpha: 0, y: 18 },
                                {
                                    autoAlpha: 1,
                                    y: 0,
                                    duration: 0.7,
                                    stagger: 0.06,
                                    ease: 'power3.out',
                                },
                                '<0.1',
                            );
                    }

                    timeline.current = tl;

                    return () => {
                        timeline.current = null;
                    };
                },
            );
        },
        { scope: dialogRef },
    );

    const openMenu = () => {
        const dialog = dialogRef.current;

        if (!dialog || dialog.open) {
            return;
        }

        lockScroll();
        dialog.showModal();
        setOpen(true);
        closeRef.current?.focus();
        timeline.current?.timeScale(1).play();
    };

    const closeMenu = useCallback(() => {
        const finish = () => {
            dialogRef.current?.close();
            unlockScroll();
            setOpen(false);
            setLeavingFor(null);
            toggleRef.current?.focus({ preventScroll: true });
        };
        const tl = timeline.current;

        if (!tl || tl.progress() === 0) {
            finish();

            return;
        }

        tl.eventCallback('onReverseComplete', finish);
        tl.timeScale(1.6).reverse();
    }, []);

    // A page picked in the menu loads behind the closed curtains; once it
    // is there, they draw open onto it.
    const navigate = (event: MouseEvent, href: string) => {
        if (!isPlainClick(event)) {
            return;
        }

        event.preventDefault();

        if (href === new URL(url, window.location.origin).pathname) {
            closeMenu();

            return;
        }

        setLeavingFor(href);
        router.visit(href, { onFinish: () => closeMenu() });
    };

    // Rotating or resizing up to the desktop layout drops the menu at once.
    useEffect(() => {
        if (!open) {
            return;
        }

        const desktop = window.matchMedia('(min-width: 1024px)');
        const onChange = () => {
            if (desktop.matches) {
                timeline.current?.pause(0);
                dialogRef.current?.close();
                unlockScroll();
                setOpen(false);
            }
        };
        desktop.addEventListener('change', onChange);

        return () => desktop.removeEventListener('change', onChange);
    }, [open]);

    useEffect(() => () => unlockScroll(), []);

    const pill =
        'inline-flex h-11 items-center gap-3 rounded-full px-5 font-sans text-[11px] font-medium tracking-[0.14em] touch-manipulation transition-[background-color,scale] duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 motion-safe:active:scale-95';

    return (
        <>
            <header
                ref={barRef}
                className={cn(
                    'px-3 pt-[max(0.75rem,env(safe-area-inset-top))] lg:hidden',
                    className,
                )}
            >
                <div className="relative flex h-14 items-center justify-between overflow-hidden rounded-full bg-white/80 pr-1.5 pl-5 shadow-[0_10px_30px_-14px_rgb(74_48_32/0.35)] ring-1 ring-ink/6 backdrop-blur-xl">
                    <Link href="/" aria-label="HFJE home" className="block">
                        <Logo size={26} />
                    </Link>

                    <button
                        ref={toggleRef}
                        type="button"
                        onClick={openMenu}
                        aria-expanded={open}
                        aria-controls="site-menu"
                        className={cn(
                            pill,
                            'bg-brand text-cream hover:bg-brand-hover focus-visible:outline-brand',
                        )}
                    >
                        MENU
                        <span aria-hidden="true" className="grid gap-[5px]">
                            <i className="block h-px w-[18px] bg-current" />
                            <i className="block h-px w-[12px] justify-self-end bg-current" />
                        </span>
                    </button>

                    {/* A thread of terracotta along the foot of the bar,
                        filling with the scroll down the page. */}
                    <span
                        aria-hidden="true"
                        className="absolute inset-x-8 bottom-0 h-px bg-brand/15"
                    >
                        <span
                            ref={progressRef}
                            className="absolute inset-0 bg-brand"
                            style={{ transform: 'scaleX(0)' }}
                        />
                    </span>
                </div>
            </header>

            <dialog
                ref={dialogRef}
                id="site-menu"
                aria-label="Site menu"
                onCancel={(event) => {
                    event.preventDefault();
                    closeMenu();
                }}
                className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none overflow-hidden overscroll-contain border-0 bg-transparent p-0 text-cream backdrop:bg-transparent lg:open:hidden"
            >
                {/* The two halves of the curtain, pleated, meeting at a
                    soft seam in the middle. */}
                <div
                    aria-hidden="true"
                    style={{ backgroundImage: PLEATS }}
                    className="menu-panel menu-panel-left absolute inset-y-0 left-0 w-[50.2%] bg-brand shadow-[inset_-14px_0_24px_-18px_rgb(0_0_0/0.45)]"
                />
                <div
                    aria-hidden="true"
                    style={{ backgroundImage: PLEATS }}
                    className="menu-panel menu-panel-right absolute inset-y-0 right-0 w-[50.2%] bg-brand shadow-[inset_14px_0_24px_-18px_rgb(0_0_0/0.45)]"
                />

                <div className="menu-inner relative mx-auto grid h-full max-w-xl [scrollbar-width:none] grid-rows-[auto_1fr_auto] overflow-y-auto px-6 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
                    <div className="menu-bar flex h-14 items-center justify-between">
                        <Link
                            href="/"
                            aria-label="HFJE home"
                            onClick={(event) => navigate(event, '/')}
                            className="block"
                        >
                            <Logo invert size={26} />
                        </Link>
                        <button
                            ref={closeRef}
                            type="button"
                            onClick={closeMenu}
                            className={cn(
                                pill,
                                'bg-cream/15 text-cream hover:bg-cream/25 focus-visible:outline-cream',
                            )}
                        >
                            CLOSE
                            <span
                                aria-hidden="true"
                                className="relative block size-3.5"
                            >
                                <i className="absolute top-1/2 left-0 block h-px w-full rotate-45 bg-current" />
                                <i className="absolute top-1/2 left-0 block h-px w-full -rotate-45 bg-current" />
                            </span>
                        </button>
                    </div>

                    <nav
                        aria-label="Main navigation"
                        className="flex flex-col self-center py-8"
                    >
                        {navItems.map((item, index) => {
                            const active = isActive(url, item.href);
                            const loading = leavingFor === item.href;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={(event) =>
                                        navigate(event, item.href)
                                    }
                                    aria-current={active ? 'page' : undefined}
                                    className="group relative flex items-center gap-4 py-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
                                >
                                    <span
                                        className={cn(
                                            'menu-index w-6 shrink-0 self-start pt-1.5 font-sans text-[11px] tabular-nums',
                                            active
                                                ? 'text-cream'
                                                : 'text-cream/50',
                                        )}
                                    >
                                        0{index + 1}
                                    </span>
                                    <span className="block min-w-0 overflow-hidden pb-[0.08em]">
                                        <span
                                            className={cn(
                                                'menu-label block font-display text-[clamp(1.5rem,7.2vw,2.6rem)] leading-[1.1] tracking-[-0.02em] transition-[color,opacity] duration-300',
                                                active
                                                    ? 'text-white'
                                                    : 'text-cream/75 group-hover:text-white',
                                                loading && 'animate-pulse',
                                            )}
                                        >
                                            {item.label}
                                        </span>
                                    </span>
                                    <ArrowUpRight
                                        aria-hidden="true"
                                        className="menu-arrow ml-auto size-6 shrink-0 text-cream/70 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                        strokeWidth={1.25}
                                    />
                                    <span
                                        aria-hidden="true"
                                        className="menu-rule absolute inset-x-0 bottom-0 h-px origin-left bg-cream/20"
                                    />
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="menu-footer grid gap-4 border-t border-cream/20 pt-6">
                        <p className="font-display text-lg leading-snug text-white">
                            Crafted Around Living.
                        </p>
                        {(contact.email || contact.phoneNumber) && (
                            <div className="flex flex-wrap gap-x-5 gap-y-1 font-sans text-sm text-cream/80">
                                {contact.phoneNumber && (
                                    <a
                                        href={`tel:${contact.phoneNumber.replace(/[^\d+]/g, '')}`}
                                        className="transition-colors hover:text-white"
                                    >
                                        {contact.phoneNumber}
                                    </a>
                                )}
                                {contact.email && (
                                    <a
                                        href={`mailto:${contact.email}`}
                                        className="transition-colors hover:text-white"
                                    >
                                        {contact.email}
                                    </a>
                                )}
                            </div>
                        )}
                        {socials.length > 0 && (
                            <div className="flex flex-wrap gap-x-5 gap-y-1 font-sans text-xs tracking-[0.14em] text-cream/65 uppercase">
                                {socials.map((social) => (
                                    <a
                                        key={social.url}
                                        href={social.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="transition-colors hover:text-white"
                                    >
                                        {social.label}
                                    </a>
                                ))}
                            </div>
                        )}
                        <Link
                            href="/contact"
                            onClick={(event) => navigate(event, '/contact')}
                            className="mt-1 flex h-13 items-center justify-center gap-2 rounded-full bg-cream font-sans text-sm font-semibold tracking-[0.12em] text-brand transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cream"
                        >
                            GET IN TOUCH
                            <ArrowUpRight
                                aria-hidden="true"
                                className="size-4"
                                strokeWidth={2}
                            />
                        </Link>
                    </div>
                </div>
            </dialog>
        </>
    );
}
