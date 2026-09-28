import { Head, useForm, usePage } from '@inertiajs/react';
import { ArrowRight, Check, Loader2, Mail, Phone } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

type Topic = 'interiors' | 'curtains' | 'bayte' | 'living-edit' | 'other';

/** What a visitor can write about, each with a nudge for the message. */
const topics: { value: Topic; label: string; prompt: string }[] = [
    {
        value: 'interiors',
        label: 'Interiors',
        prompt: 'The space, its size, and what you would like it to become.',
    },
    {
        value: 'curtains',
        label: 'Curtains & Textiles',
        prompt: 'How many windows, which rooms, and the feel you are after.',
    },
    {
        value: 'bayte',
        label: 'BAYTÉ',
        prompt: 'The pieces you have in mind, and where they will live.',
    },
    {
        value: 'living-edit',
        label: 'The Living Edit',
        prompt: 'The room you put together, and what you would like to change.',
    },
    {
        value: 'other',
        label: 'Something else',
        prompt: 'A room, a whole home, or just an idea.',
    },
];

/** A topic from a link like /contact?topic=curtains, if it names one. */
function topicFromUrl(): Topic {
    const requested = new URLSearchParams(window.location.search).get('topic');

    return topics.find((topic) => topic.value === requested)?.value ?? 'other';
}

/**
 * Shared look for every field. The resting border is dark enough to clear the
 * 3:1 contrast floor for interactive boundaries, not just decorative hairlines.
 */
const inputClasses =
    'w-full rounded-xl border border-ink/40 bg-white px-4 py-3 text-base text-ink outline-none transition-[border-color,box-shadow] duration-200 ease-out placeholder:text-ink/50 hover:border-ink/60 focus:border-brand focus:ring-4 focus:ring-brand/15 aria-invalid:border-red-700 motion-reduce:transition-none';
const labelClasses = 'block text-sm font-medium text-ink';
const EASE = [0.22, 1, 0.36, 1] as const;

function FieldError({ id, message }: { id: string; message?: string }) {
    return message ? (
        <p id={id} className="text-sm text-red-700">
            {message}
        </p>
    ) : null;
}

export default function Contact() {
    const { contact, socials } = usePage().props;
    const reducedMotion = useReducedMotion();
    const [sentTo, setSentTo] = useState<string | null>(null);
    const form = useForm({
        topic: topicFromUrl(),
        name: '',
        email: '',
        phone: '',
        message: '',
        website: '',
    });

    const prompt =
        topics.find((topic) => topic.value === form.data.topic)?.prompt ?? '';

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.post('/contact', {
            preserveScroll: true,
            onSuccess: () => {
                setSentTo(form.data.name.trim().split(/\s+/)[0] ?? '');
                form.reset('name', 'email', 'phone', 'message');
            },
        });
    };

    const channels = [
        contact.phoneNumber && {
            label: 'Call the studio',
            value: contact.phoneNumber,
            href: `tel:${contact.phoneNumber.replace(/[^\d+]/g, '')}`,
            icon: Phone,
        },
        contact.email && {
            label: 'Email',
            value: contact.email,
            href: `mailto:${contact.email}`,
            icon: Mail,
        },
    ].filter((channel) => !!channel);

    return (
        <>
            <Head title="Contact">
                <meta
                    name="description"
                    content="Tell HFJE about the space you want to transform: interiors, curtains, BAYTÉ furniture or the Living Edit."
                />
            </Head>

            <section className="@container w-full px-6 pt-8 pb-16 font-display md:px-12 md:pt-12 md:pb-20 lg:pr-16 lg:pl-0">
                <div className="grid gap-10 @4xl:grid-cols-12 @4xl:gap-12">
                    <aside className="flex min-w-0 flex-col @4xl:col-span-4">
                        <h1 className="text-[clamp(2rem,4.4cqi,3.25rem)] leading-[1.1] text-ink">
                            Let&rsquo;s talk.
                        </h1>
                        <p className="mt-4 max-w-sm font-sans text-base leading-relaxed text-ink/70">
                            Tell us about the space you want to transform. We
                            reply within two working days.
                        </p>

                        {channels.length > 0 && (
                            <ul className="mt-8 grid gap-2 font-sans">
                                {channels.map((channel) => (
                                    <li key={channel.label}>
                                        <a
                                            href={channel.href}
                                            className="group flex items-center gap-4 rounded-2xl bg-surface p-3 pr-4 transition-colors duration-300 hover:bg-cream/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                                        >
                                            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-brand transition-colors duration-300 group-hover:bg-brand group-hover:text-brand-foreground">
                                                <channel.icon
                                                    className="size-4.5"
                                                    strokeWidth={1.75}
                                                />
                                            </span>
                                            <span className="min-w-0">
                                                <span className="block text-xs text-ink/60">
                                                    {channel.label}
                                                </span>
                                                <span className="block truncate text-base text-ink">
                                                    {channel.value}
                                                </span>
                                            </span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {socials.length > 0 && (
                            <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 font-sans text-sm">
                                {socials.map((social) => (
                                    <li key={social.url}>
                                        <a
                                            href={social.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-ink/70 underline-offset-4 transition-colors hover:text-brand hover:underline focus-visible:outline-2 focus-visible:outline-brand"
                                        >
                                            {social.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        )}

                        <img
                            src="/images/curtains/curtain-light.webp"
                            alt=""
                            loading="lazy"
                            decoding="async"
                            draggable={false}
                            className="mt-10 hidden aspect-4/3 w-full rounded-2xl object-cover @4xl:mt-auto @4xl:block"
                        />
                    </aside>

                    <div className="min-w-0 rounded-3xl bg-surface p-5 @md:p-8 @4xl:col-span-8">
                        <AnimatePresence mode="wait" initial={false}>
                            {sentTo !== null ? (
                                <motion.div
                                    key="sent"
                                    initial={
                                        reducedMotion
                                            ? false
                                            : { opacity: 0, y: 12 }
                                    }
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.4, ease: EASE }}
                                    role="status"
                                    className="flex min-h-96 flex-col items-center justify-center py-10 text-center"
                                >
                                    <span className="grid size-14 place-items-center rounded-full bg-brand text-brand-foreground">
                                        <Check
                                            className="size-6"
                                            strokeWidth={2.25}
                                        />
                                    </span>
                                    <h2 className="mt-6 text-2xl text-ink">
                                        Thank you
                                        {sentTo ? `, ${sentTo}` : ''}.
                                    </h2>
                                    <p className="mt-3 max-w-sm font-sans text-base leading-relaxed text-ink/70">
                                        Your message is with the studio. We
                                        reply within two working days.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setSentTo(null)}
                                        className="mt-8 rounded-full border border-ink/25 px-7 py-3 font-sans text-sm text-ink transition-colors hover:border-ink/60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
                                    >
                                        Send another message
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.form
                                    key="form"
                                    onSubmit={submit}
                                    noValidate
                                    initial={
                                        reducedMotion ? false : { opacity: 0 }
                                    }
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.25 }}
                                    className="flex flex-col gap-6 font-sans"
                                >
                                    <fieldset>
                                        <legend className="font-display text-lg text-ink">
                                            What&rsquo;s it about?
                                        </legend>
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {topics.map((topic) => (
                                                <label
                                                    key={topic.value}
                                                    className="cursor-pointer"
                                                >
                                                    <input
                                                        type="radio"
                                                        name="topic"
                                                        value={topic.value}
                                                        checked={
                                                            form.data.topic ===
                                                            topic.value
                                                        }
                                                        onChange={() =>
                                                            form.setData(
                                                                'topic',
                                                                topic.value,
                                                            )
                                                        }
                                                        className="peer sr-only"
                                                    />
                                                    <span className="inline-flex min-h-11 items-center gap-2 rounded-full border border-ink/25 bg-white px-4 text-sm text-ink transition-colors duration-200 peer-checked:border-brand peer-checked:bg-brand peer-checked:text-brand-foreground peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand hover:border-ink/50 peer-checked:hover:border-brand">
                                                        {topic.label}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </fieldset>

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
                                            maxLength={100}
                                            value={form.data.name}
                                            onChange={(event) =>
                                                form.setData(
                                                    'name',
                                                    event.target.value,
                                                )
                                            }
                                            aria-invalid={!!form.errors.name}
                                            aria-describedby="contact-name-error"
                                            className={inputClasses}
                                        />
                                        <FieldError
                                            id="contact-name-error"
                                            message={form.errors.name}
                                        />
                                    </div>

                                    <div className="grid gap-6 @2xl:grid-cols-2">
                                        <div className="flex flex-col gap-2">
                                            <label
                                                htmlFor="contact-email"
                                                className={labelClasses}
                                            >
                                                Email
                                            </label>
                                            <input
                                                id="contact-email"
                                                type="email"
                                                autoComplete="email"
                                                maxLength={255}
                                                value={form.data.email}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'email',
                                                        event.target.value,
                                                    )
                                                }
                                                aria-invalid={
                                                    !!form.errors.email
                                                }
                                                aria-describedby="contact-reach-hint contact-email-error"
                                                className={inputClasses}
                                            />
                                            <FieldError
                                                id="contact-email-error"
                                                message={form.errors.email}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label
                                                htmlFor="contact-phone"
                                                className={labelClasses}
                                            >
                                                Phone
                                            </label>
                                            <input
                                                id="contact-phone"
                                                type="tel"
                                                autoComplete="tel"
                                                maxLength={30}
                                                value={form.data.phone}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'phone',
                                                        event.target.value,
                                                    )
                                                }
                                                aria-invalid={
                                                    !!form.errors.phone
                                                }
                                                aria-describedby="contact-reach-hint contact-phone-error"
                                                className={inputClasses}
                                            />
                                            <FieldError
                                                id="contact-phone-error"
                                                message={
                                                    // Both fields say the same thing when
                                                    // neither is filled; show it once.
                                                    form.errors.email &&
                                                    form.errors.phone ===
                                                        form.errors.email
                                                        ? undefined
                                                        : form.errors.phone
                                                }
                                            />
                                        </div>
                                        <p
                                            id="contact-reach-hint"
                                            className="-mt-3 text-sm text-ink/60 @2xl:col-span-2"
                                        >
                                            Email or phone, whichever suits you.
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label
                                            htmlFor="contact-message"
                                            className={labelClasses}
                                        >
                                            Your message
                                        </label>
                                        <textarea
                                            id="contact-message"
                                            rows={5}
                                            maxLength={3000}
                                            value={form.data.message}
                                            onChange={(event) =>
                                                form.setData(
                                                    'message',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder={prompt}
                                            aria-invalid={!!form.errors.message}
                                            aria-describedby="contact-message-error"
                                            className={cn(
                                                inputClasses,
                                                'resize-none leading-relaxed',
                                            )}
                                        />
                                        <FieldError
                                            id="contact-message-error"
                                            message={form.errors.message}
                                        />
                                    </div>

                                    {/* Left empty by people; bots fill it in. */}
                                    <input
                                        type="text"
                                        name="website"
                                        value={form.data.website}
                                        onChange={(event) =>
                                            form.setData(
                                                'website',
                                                event.target.value,
                                            )
                                        }
                                        tabIndex={-1}
                                        autoComplete="off"
                                        aria-hidden="true"
                                        className="absolute -left-[9999px] size-px opacity-0"
                                    />

                                    {form.hasErrors &&
                                        !form.errors.name &&
                                        !form.errors.email &&
                                        !form.errors.phone &&
                                        !form.errors.message && (
                                            <p className="text-sm text-red-700">
                                                Something went wrong. Please try
                                                again in a moment.
                                            </p>
                                        )}

                                    <button
                                        type="submit"
                                        disabled={form.processing}
                                        className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-brand px-9 text-sm text-brand-foreground transition-colors duration-300 hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand disabled:opacity-70 @2xl:self-start"
                                    >
                                        {form.processing ? (
                                            <>
                                                <Loader2
                                                    aria-hidden="true"
                                                    className="size-4 animate-spin"
                                                />
                                                Sending
                                            </>
                                        ) : (
                                            <>
                                                Send message
                                                <ArrowRight
                                                    aria-hidden="true"
                                                    className="size-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none"
                                                    strokeWidth={2}
                                                />
                                            </>
                                        )}
                                    </button>
                                </motion.form>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </section>
        </>
    );
}
