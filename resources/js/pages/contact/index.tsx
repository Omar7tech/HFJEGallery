import { useForm, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Check,
    ChevronDown,
    Loader2,
    Mail,
    Phone,
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

type Topic = 'interiors' | 'curtains' | 'bayte' | 'living-edit' | 'other';
type Field = 'name' | 'email' | 'phone' | 'message';
type FieldErrors = Partial<Record<Field, string>>;

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

/** Kept in step with StoreContactMessageRequest, so a bad form never leaves the page. */
const MESSAGE_MAX = 3000;
const MAX_LINKS = 2;
const LINK = /https?:\/\/|www\./gi;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^[\d\s\-().]+$/;
const FIELDS: Field[] = ['name', 'phone', 'email', 'message'];

/** Lebanon first, then the codes visitors most often write from. */
const countryCodes: { code: string; name: string }[] = [
    { code: '+961', name: 'Lebanon' },
    { code: '+971', name: 'UAE' },
    { code: '+966', name: 'Saudi Arabia' },
    { code: '+974', name: 'Qatar' },
    { code: '+965', name: 'Kuwait' },
    { code: '+973', name: 'Bahrain' },
    { code: '+968', name: 'Oman' },
    { code: '+962', name: 'Jordan' },
    { code: '+964', name: 'Iraq' },
    { code: '+20', name: 'Egypt' },
    { code: '+357', name: 'Cyprus' },
    { code: '+33', name: 'France' },
    { code: '+44', name: 'United Kingdom' },
    { code: '+49', name: 'Germany' },
    { code: '+1', name: 'USA / Canada' },
    { code: '+61', name: 'Australia' },
];

/**
 * The full international number: the code, then the local number without
 * the trunk 0 people dial at home (03 145 782 becomes +961 3 145 782).
 */
function fullPhoneNumber(countryCode: string, local: string): string {
    return `${countryCode} ${local.trim().replace(/^0+/, '')}`;
}

function validate(data: Record<Field, string>): FieldErrors {
    const errors: FieldErrors = {};
    const name = data.name.trim();
    const email = data.email.trim();
    const phone = data.phone.trim();
    const message = data.message.trim();

    if (name.length < 2) {
        errors.name = 'Please enter your name.';
    } else if (/https?:\/\/|www\./i.test(name)) {
        errors.name = 'Please enter just your name.';
    }

    const phoneDigits = phone.replace(/\D/g, '').replace(/^0+/, '');

    if (!phone) {
        errors.phone = 'Please enter your phone number.';
    } else if (
        !PHONE.test(phone) ||
        phoneDigits.length < 6 ||
        phoneDigits.length > 12
    ) {
        errors.phone = 'That doesn’t look like a phone number.';
    }

    if (email && !EMAIL.test(email)) {
        errors.email = 'That email doesn’t look right.';
    }

    if (message.length < 10) {
        errors.message = 'Tell us a little more, at least a few words.';
    } else if ((message.match(LINK) ?? []).length > MAX_LINKS) {
        errors.message = `Please keep it to ${MAX_LINKS} links or fewer.`;
    }

    return errors;
}

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
    'w-full rounded-xl border border-ink/35 bg-white px-3.5 py-2.5 text-base text-ink outline-none transition-[border-color,box-shadow] duration-200 ease-out placeholder:text-ink/50 hover:border-ink/55 focus:border-brand focus:ring-4 focus:ring-brand/15 aria-invalid:border-red-700 aria-invalid:focus:ring-red-700/15 motion-reduce:transition-none';
const labelClasses = 'text-sm font-medium text-ink';
const EASE = [0.22, 1, 0.36, 1] as const;

function FieldError({ id, message }: { id: string; message?: string }) {
    return message ? (
        <p id={id} className="text-sm text-red-700">
            {message}
        </p>
    ) : null;
}

export default function Contact({ formToken }: { formToken: string }) {
    const { contact, socials } = usePage().props;
    const reducedMotion = useReducedMotion();
    const [sentTo, setSentTo] = useState<string | null>(null);
    const [touched, setTouched] = useState<Set<Field>>(new Set());
    const [attempted, setAttempted] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [countryCode, setCountryCode] = useState('+961');
    const form = useForm({
        topic: topicFromUrl(),
        name: '',
        email: '',
        phone: '',
        message: '',
        website: '',
    });

    const clientErrors = validate(form.data);

    /** The client's view once a field has been left or a send tried; the server's otherwise. */
    const errorFor = (field: Field): string | undefined =>
        (attempted || touched.has(field) ? clientErrors[field] : undefined) ??
        form.errors[field];

    const update = (field: Field, value: string) => {
        form.setData(field, value);
        form.clearErrors(field);
        setFormError(null);
    };

    const leave = (field: Field) =>
        setTouched((previous) => new Set(previous).add(field));

    const prompt =
        topics.find((topic) => topic.value === form.data.topic)?.prompt ?? '';

    const submit = (event: FormEvent) => {
        event.preventDefault();
        setAttempted(true);
        setFormError(null);

        // Nothing is sent until the form is right; the first problem gets focus.
        const firstInvalid = FIELDS.find((field) => clientErrors[field]);

        if (firstInvalid) {
            document.getElementById(`contact-${firstInvalid}`)?.focus();

            return;
        }

        form.transform((data) => ({
            ...data,
            phone: fullPhoneNumber(countryCode, data.phone),
            form_token: formToken,
        }));
        form.post('/contact', {
            preserveScroll: true,
            onSuccess: () => {
                setSentTo(form.data.name.trim().split(/\s+/)[0] ?? '');
                setAttempted(false);
                setTouched(new Set());
                form.reset('name', 'email', 'phone', 'message');
            },
            onError: (errors) => {
                if ('form_token' in errors || 'topic' in errors) {
                    setFormError(
                        'This form has expired. Refresh the page and try again.',
                    );
                }
            },
            onHttpException: (response) => {
                setFormError(
                    response.status === 429
                        ? 'You’ve sent a few messages already. Please wait a minute and try again.'
                        : 'Something went wrong on our side. Please try again in a moment.',
                );

                return false;
            },
            onNetworkError: () => {
                setFormError(
                    'We couldn’t reach the studio. Check your connection and try again.',
                );

                return false;
            },
        });
    };

    const channels = [
        contact.phoneNumber && {
            label: 'Call',
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

    const fieldProps = (field: Field) => ({
        id: `contact-${field}`,
        value: form.data[field],
        onBlur: () => leave(field),
        'aria-invalid': !!errorFor(field),
    });

    return (
        <>
            <section className="@container w-full px-5 pt-8 pb-16 font-display max-md:pt-5 max-md:pb-10 md:px-12 md:pt-12 md:pb-20 lg:pr-16 lg:pl-0">
                {/* Title on the left, the direct lines to the studio on the
                    right; the form takes the full width below. */}
                <div className="flex flex-col gap-6 @4xl:flex-row @4xl:items-end @4xl:justify-between @4xl:gap-10">
                    <div>
                        <h1 className="text-[clamp(2rem,4.4cqi,3rem)] leading-[1.1] text-ink">
                            Let&rsquo;s talk.
                        </h1>
                        <p className="mt-3 max-w-lg font-sans text-base leading-relaxed text-ink/70">
                            Tell us about the space you want to transform. We
                            reply within two working days.
                        </p>
                    </div>

                    {(channels.length > 0 || socials.length > 0) && (
                        <div className="flex flex-col gap-4 font-sans @4xl:items-end">
                            {channels.length > 0 && (
                                <ul className="flex flex-wrap gap-2 @4xl:justify-end">
                                    {channels.map((channel) => (
                                        <li key={channel.label}>
                                            <a
                                                href={channel.href}
                                                className="group flex items-center gap-3.5 rounded-2xl border border-ink/12 p-3 pr-4 transition-colors duration-300 hover:border-brand/40 hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                                            >
                                                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-surface text-brand transition-colors duration-300 group-hover:bg-brand group-hover:text-brand-foreground">
                                                    <channel.icon
                                                        className="size-4.5"
                                                        strokeWidth={1.75}
                                                    />
                                                </span>
                                                <span className="min-w-0">
                                                    <span className="block text-xs text-ink/60">
                                                        {channel.label}
                                                    </span>
                                                    <span className="block truncate text-sm text-ink">
                                                        {channel.value}
                                                    </span>
                                                </span>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {socials.length > 0 && (
                                <div>
                                    <p className="text-xs text-ink/60 @4xl:text-right">
                                        Follow the studio
                                    </p>
                                    <ul className="mt-2 flex flex-wrap gap-1.5 @4xl:justify-end">
                                        {socials.map((social) => (
                                            <li key={social.url}>
                                                <a
                                                    href={social.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex min-h-9 items-center rounded-full bg-surface px-3.5 text-sm text-ink transition-colors hover:bg-brand hover:text-brand-foreground focus-visible:outline-2 focus-visible:outline-brand"
                                                >
                                                    {social.label}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="mt-8 min-w-0 rounded-3xl bg-surface p-5 @md:p-7 @3xl:p-8">
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
                                className="flex flex-col items-start gap-5 py-6 @lg:flex-row @lg:items-center"
                            >
                                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-brand text-brand-foreground">
                                    <Check
                                        className="size-5"
                                        strokeWidth={2.25}
                                    />
                                </span>
                                <div className="flex-1">
                                    <h2 className="text-xl text-ink">
                                        Thank you
                                        {sentTo ? `, ${sentTo}` : ''}.
                                    </h2>
                                    <p className="mt-1.5 font-sans text-sm leading-relaxed text-ink/70">
                                        Your message is with the studio. We
                                        reply within two working days.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSentTo(null)}
                                    className="rounded-full border border-ink/25 px-6 py-2.5 font-sans text-sm text-ink transition-colors hover:border-ink/60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
                                >
                                    Send another
                                </button>
                            </motion.div>
                        ) : (
                            <motion.form
                                key="form"
                                onSubmit={submit}
                                noValidate
                                initial={reducedMotion ? false : { opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.25 }}
                                className="flex flex-col gap-5 font-sans"
                            >
                                <fieldset>
                                    <legend className={labelClasses}>
                                        What&rsquo;s it about?
                                    </legend>
                                    <div className="mt-2.5 flex flex-wrap gap-1.5">
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
                                                <span className="inline-flex min-h-10 items-center rounded-full border border-ink/20 bg-white px-4 text-sm text-ink transition-colors duration-200 peer-checked:border-brand peer-checked:bg-brand peer-checked:text-brand-foreground peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand hover:border-ink/45 peer-checked:hover:border-brand">
                                                    {topic.label}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </fieldset>

                                <div className="grid gap-4 @2xl:grid-cols-3">
                                    <div className="flex flex-col gap-1.5">
                                        <label
                                            htmlFor="contact-name"
                                            className={labelClasses}
                                        >
                                            Name
                                        </label>
                                        <input
                                            {...fieldProps('name')}
                                            type="text"
                                            autoComplete="name"
                                            maxLength={100}
                                            onChange={(event) =>
                                                update(
                                                    'name',
                                                    event.target.value,
                                                )
                                            }
                                            aria-describedby="contact-name-error"
                                            className={inputClasses}
                                        />
                                        <FieldError
                                            id="contact-name-error"
                                            message={errorFor('name')}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label
                                            htmlFor="contact-phone"
                                            className={labelClasses}
                                        >
                                            Phone
                                        </label>
                                        {/* The country code sits inside the
                                            field, Lebanon to start with, so
                                            only the local number is typed. */}
                                        <div
                                            className={cn(
                                                'flex rounded-xl border bg-white transition-[border-color,box-shadow] duration-200 ease-out focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/15 motion-reduce:transition-none',
                                                errorFor('phone')
                                                    ? 'border-red-700 focus-within:ring-red-700/15'
                                                    : 'border-ink/35 hover:border-ink/55',
                                            )}
                                        >
                                            {/* The closed select shows the code
                                                alone; the list names each
                                                country. The native select sits
                                                invisibly on top, so it keeps
                                                its keyboard and phone picker. */}
                                            <label className="relative flex shrink-0 items-center gap-1.5 rounded-l-xl border-r border-ink/15 py-2.5 pr-2.5 pl-3.5 text-base text-ink tabular-nums">
                                                <span className="sr-only">
                                                    Country code
                                                </span>
                                                <span aria-hidden="true">
                                                    {countryCode}
                                                </span>
                                                <ChevronDown
                                                    aria-hidden="true"
                                                    className="size-3.5 text-ink/50"
                                                    strokeWidth={2}
                                                />
                                                <select
                                                    value={countryCode}
                                                    onChange={(event) => {
                                                        setCountryCode(
                                                            event.target.value,
                                                        );
                                                        form.clearErrors(
                                                            'phone',
                                                        );
                                                    }}
                                                    className="absolute inset-0 cursor-pointer appearance-none rounded-l-xl text-base opacity-0"
                                                >
                                                    {countryCodes.map(
                                                        (country) => (
                                                            <option
                                                                key={
                                                                    country.name
                                                                }
                                                                value={
                                                                    country.code
                                                                }
                                                            >
                                                                {country.code}{' '}
                                                                {country.name}
                                                            </option>
                                                        ),
                                                    )}
                                                </select>
                                            </label>
                                            <input
                                                {...fieldProps('phone')}
                                                type="tel"
                                                inputMode="tel"
                                                autoComplete="tel-national"
                                                maxLength={20}
                                                placeholder={
                                                    countryCode === '+961'
                                                        ? '3 145 782'
                                                        : undefined
                                                }
                                                onChange={(event) =>
                                                    update(
                                                        'phone',
                                                        event.target.value,
                                                    )
                                                }
                                                aria-describedby="contact-phone-error"
                                                className="w-full min-w-0 rounded-r-xl bg-transparent px-3.5 py-2.5 text-base text-ink outline-none placeholder:text-ink/40"
                                            />
                                        </div>
                                        <FieldError
                                            id="contact-phone-error"
                                            message={errorFor('phone')}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label
                                            htmlFor="contact-email"
                                            className={labelClasses}
                                        >
                                            Email{' '}
                                            <span className="font-normal text-ink/55">
                                                (optional)
                                            </span>
                                        </label>
                                        <input
                                            {...fieldProps('email')}
                                            type="email"
                                            autoComplete="email"
                                            maxLength={255}
                                            onChange={(event) =>
                                                update(
                                                    'email',
                                                    event.target.value,
                                                )
                                            }
                                            aria-describedby="contact-email-error"
                                            className={inputClasses}
                                        />
                                        <FieldError
                                            id="contact-email-error"
                                            message={errorFor('email')}
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <div className="flex items-baseline justify-between gap-4">
                                        <label
                                            htmlFor="contact-message"
                                            className={labelClasses}
                                        >
                                            Message
                                        </label>
                                        <span
                                            aria-hidden="true"
                                            className={cn(
                                                'text-xs tabular-nums',
                                                form.data.message.length >
                                                    MESSAGE_MAX * 0.9
                                                    ? 'text-brand'
                                                    : 'text-ink/45',
                                            )}
                                        >
                                            {form.data.message.length} /{' '}
                                            {MESSAGE_MAX}
                                        </span>
                                    </div>
                                    <textarea
                                        {...fieldProps('message')}
                                        rows={4}
                                        maxLength={MESSAGE_MAX}
                                        onChange={(event) =>
                                            update(
                                                'message',
                                                event.target.value,
                                            )
                                        }
                                        placeholder={prompt}
                                        aria-describedby="contact-message-error"
                                        className={cn(
                                            inputClasses,
                                            'field-sizing-content min-h-28 resize-none leading-relaxed',
                                        )}
                                    />
                                    <FieldError
                                        id="contact-message-error"
                                        message={errorFor('message')}
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

                                {formError && (
                                    <p
                                        role="alert"
                                        className="rounded-xl bg-red-700/8 px-4 py-3 text-sm text-red-800"
                                    >
                                        {formError}
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-brand px-8 text-sm text-brand-foreground transition-colors duration-300 hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand disabled:opacity-70 max-md:rounded-xl max-md:font-medium @2xl:self-start"
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
            </section>
        </>
    );
}
