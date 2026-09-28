import { Link, usePage } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import FooterMonogram from '@/components/footer-monogram';
import SilkBackground from '@/components/silk-background';
import { cn } from '@/lib/utils';

type FooterLink = { label: string; href: string; external?: boolean };

const staticColumns: { title: string; links: FooterLink[] }[] = [
    {
        title: 'Explore',
        links: [
            { label: 'Home', href: '/' },
            { label: 'Work', href: '/work' },
            { label: 'About', href: '/about' },
            { label: 'Contact', href: '/contact' },
        ],
    },
    {
        title: 'Studio',
        links: [
            { label: 'Curtains', href: '/curtains' },
            { label: 'BAYTÉ', href: '/bayte' },
            { label: 'Living Edit', href: '/living-edit' },
        ],
    },
];

function FooterLinkItem({ link }: { link: FooterLink }) {
    const className =
        'text-base text-cream/70 transition-colors hover:text-white max-md:text-[15px]';

    if (link.external) {
        const opensNewTab = link.href.startsWith('http');

        return (
            <a
                href={link.href}
                target={opensNewTab ? '_blank' : undefined}
                rel={opensNewTab ? 'noreferrer' : undefined}
                className={className}
            >
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
    const { contact, socials } = usePage().props;

    // Contact details and socials come from the admin General settings.
    const connectLinks: FooterLink[] = [
        ...(contact.phoneNumber
            ? [
                  {
                      label: contact.phoneNumber,
                      href: `tel:${contact.phoneNumber.replace(/[^\d+]/g, '')}`,
                      external: true,
                  },
              ]
            : []),
        ...(contact.email
            ? [
                  {
                      label: contact.email,
                      href: `mailto:${contact.email}`,
                      external: true,
                  },
              ]
            : []),
        ...socials.map((social) => ({
            label: social.label,
            href: social.url,
            external: true,
        })),
    ];

    const columns =
        connectLinks.length > 0
            ? [...staticColumns, { title: 'Connect', links: connectLinks }]
            : staticColumns;

    return (
        <footer
            className={cn(
                'relative flex min-h-dvh flex-col overflow-hidden bg-brand text-cream lg:h-dvh lg:min-h-[640px]',
                className,
            )}
        >
            {/* Terracotta silk weave drifting behind the whole footer; the
                solid brand fill stays as its fallback. */}
            <SilkBackground noiseIntensity={1} speed={8} color="#a65e3c" />
            {/* Steadies the contrast under the copy as the folds pass. */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-brand/45"
            />

            {/* Warm hairline marks the top edge of the footer. */}
            <div
                aria-hidden
                className="relative z-10 h-0.5 w-full bg-gradient-to-r from-cream/0 via-cream/60 to-cream/0"
            />

            <div className="relative z-10 flex min-h-0 grow flex-col px-5 pt-14 pb-6 max-md:pt-9 max-md:pb-5 sm:px-10 lg:px-16 lg:pt-[clamp(2.5rem,7vh,4.5rem)]">
                <div className="grid gap-12 max-md:gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-16">
                    {/* CTA */}
                    <div className="max-w-xl">
                        <p className="text-xs font-semibold tracking-[0.25em] text-cream/60 uppercase">
                            Start a project
                        </p>
                        <p className="mt-4 font-display text-[clamp(1.75rem,3.2vw,3rem)] leading-[1.15] text-white max-md:mt-3 max-md:text-[1.625rem]">
                            Let&rsquo;s craft something around you.
                        </p>
                        <p className="mt-4 text-base leading-relaxed text-cream/75 max-md:hidden">
                            Homes designed around the people who live in them.
                        </p>
                        <Link
                            href="/contact"
                            className="group mt-8 inline-flex items-center gap-3 rounded-full border border-cream/50 px-7 py-3.5 text-sm font-semibold tracking-[0.2em] text-white uppercase transition-colors duration-300 ease-out hover:border-cream hover:bg-cream hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cream motion-reduce:transition-none max-md:mt-5 max-md:flex max-md:w-full max-md:justify-center max-md:rounded-xl max-md:font-medium max-md:tracking-[0.02em] max-md:normal-case"
                        >
                            Get in touch
                            <ArrowRight
                                className="size-4 transition-transform duration-300 ease-out group-hover:translate-x-1 motion-reduce:transition-none"
                                strokeWidth={2.5}
                            />
                        </Link>
                    </div>

                    {/* Link columns */}
                    <div className="grid grid-cols-2 gap-8 max-md:gap-x-6 max-md:gap-y-6 sm:grid-cols-3 lg:pt-1">
                        {columns.map((column) => (
                            <div
                                key={column.title}
                                className={cn(
                                    'min-w-0',
                                    // Phones: contact details run as one row
                                    // under the two page columns.
                                    column.title === 'Connect' &&
                                        'max-sm:col-span-2',
                                )}
                            >
                                <h3 className="text-xs font-semibold tracking-[0.25em] text-cream/60 uppercase">
                                    {column.title}
                                </h3>
                                <ul
                                    className={cn(
                                        'mt-5 flex flex-col gap-3 max-md:mt-3 max-md:gap-2',
                                        column.title === 'Connect' &&
                                            'max-sm:flex-row max-sm:flex-wrap max-sm:gap-x-5',
                                    )}
                                >
                                    {column.links.map((link) => (
                                        <li
                                            key={link.label}
                                            className="break-words"
                                        >
                                            <FooterLinkItem link={link} />
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Oversized HFJE monogram — takes whatever height is left on
                    desktop so the whole footer fits one screen. */}
                <div className="mt-14 flex grow items-end max-md:mt-6 lg:mt-10 lg:min-h-0">
                    <FooterMonogram className="lg:h-full lg:max-h-[22rem]" />
                </div>

                <div className="mt-8 flex flex-col gap-4 border-t border-cream/20 pt-5 text-sm text-cream/60 max-md:mt-5 max-md:gap-2.5 max-md:pt-4 max-md:text-xs sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                    <p>
                        © {year} Home Fashion Jamaleddine. All rights reserved.
                    </p>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                        <Link
                            href="/privacy"
                            className="transition-colors hover:text-white"
                        >
                            Privacy
                        </Link>
                        <Link
                            href="/terms"
                            className="transition-colors hover:text-white"
                        >
                            Terms
                        </Link>

                        {/* Credit — studio wordmark sits inline with the label. */}
                        <a
                            href="https://yamencreates.com"
                            target="_blank"
                            rel="noreferrer"
                            className="group flex w-fit items-center gap-2.5 text-xs tracking-[0.2em] uppercase transition-colors hover:text-white"
                        >
                            Crafted by
                            <img
                                src="/logos/yamenlogo.svg"
                                alt="Yamen"
                                className="h-3 w-auto"
                            />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
