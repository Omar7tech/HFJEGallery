import { Head } from '@inertiajs/react';

/**
 * Shared look for every field. The resting border is dark enough to clear the
 * 3:1 contrast floor for interactive boundaries, not just decorative hairlines.
 */
const inputClasses =
    'w-full rounded-xl border border-ink/50 bg-white px-4 py-3.5 text-base text-ink outline-none transition-[border-color,box-shadow] duration-200 ease-out placeholder:text-ink/60 hover:border-ink/70 focus:border-brand focus:ring-4 focus:ring-brand/15 motion-reduce:transition-none';

const labelClasses = 'block text-sm font-medium text-ink';

/** Placeholder studio details. Swap these for the real ones before launch. */
const details: { heading: string; lines: string[]; href?: string }[] = [
    {
        heading: 'Telephone',
        lines: ['+961 3 145 782'],
        href: 'tel:+9613145782',
    },
    {
        heading: 'Email',
        lines: ['studio@hfje.com'],
        href: 'mailto:studio@hfje.com',
    },
];

export default function Contact() {
    return (
        <>
            <Head title="Contact" />

            <section className="@container w-full px-6 py-16 font-display md:px-12 md:py-24 lg:pr-16 lg:pl-0">
                <h1 className="max-w-4xl text-[clamp(2rem,9cqi,4rem)] leading-[1.1] text-ink">
                    Let&rsquo;s talk.
                </h1>

                <p className="mt-6 max-w-xl font-sans text-base leading-relaxed text-ink/75 @lg:text-lg">
                    Tell us about the space you want to transform. We reply
                    within two working days.
                </p>

                {/* One rule across the top ties the form and the studio lines
                    together instead of boxing each of them. */}
                <div className="mt-14 grid gap-12 border-t border-ink/15 pt-12 @3xl:grid-cols-12 @3xl:gap-16">
                    <form className="flex flex-col gap-6 font-sans @3xl:col-span-7">
                        <div className="grid gap-6 @2xl:grid-cols-2">
                            <div className="flex flex-col gap-2">
                                <label
                                    htmlFor="contact-name"
                                    className={labelClasses}
                                >
                                    Your name
                                </label>
                                <input
                                    id="contact-name"
                                    type="text"
                                    autoComplete="name"
                                    placeholder="First and last name"
                                    className={inputClasses}
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label
                                    htmlFor="contact-email"
                                    className={labelClasses}
                                >
                                    Email address
                                </label>
                                <input
                                    id="contact-email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="you@example.com"
                                    className={inputClasses}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label
                                htmlFor="contact-message"
                                className={labelClasses}
                            >
                                Your project
                            </label>
                            <textarea
                                id="contact-message"
                                rows={6}
                                placeholder="A room, a whole home, curtains, or just an idea"
                                className={`${inputClasses} resize-none leading-relaxed`}
                            />
                        </div>

                        <button
                            type="button"
                            className="mt-2 w-full rounded-full bg-brand px-10 py-4 text-sm font-semibold tracking-[0.15em] text-brand-foreground uppercase transition-colors duration-300 ease-out hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand motion-reduce:transition-none @2xl:w-auto @2xl:self-start"
                        >
                            Send message
                        </button>
                    </form>

                    {/* Studio lines sit in the last four columns, offset to keep
                        an open right margin against the form. */}
                    <div className="min-w-0 @3xl:col-span-4 @3xl:col-start-9">
                        <dl className="flex flex-col gap-6 font-sans">
                            {details.map((detail) => (
                                <div key={detail.heading}>
                                    <dt className="text-sm text-ink/70">
                                        {detail.heading}
                                    </dt>
                                    <dd className="mt-1 text-base leading-relaxed text-ink">
                                        {detail.href ? (
                                            <a
                                                href={detail.href}
                                                className="break-words transition-colors duration-200 ease-out hover:text-brand-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand motion-reduce:transition-none"
                                            >
                                                {detail.lines[0]}
                                            </a>
                                        ) : (
                                            detail.lines.map((line) => (
                                                <span
                                                    key={line}
                                                    className="block"
                                                >
                                                    {line}
                                                </span>
                                            ))
                                        )}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                </div>
            </section>
        </>
    );
}
