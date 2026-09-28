import { ArrowRight, Check, Plus, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import type { SelectedPiece } from '@/lib/bayte-selection';
import {
    bayteSelection,
    buildEnquiryMessage,
    readSavedName,
    saveName,
    SELECTION_LIMIT,
    useBayteSelection,
    whatsappUrl,
} from '@/lib/bayte-selection';
import { cn } from '@/lib/utils';

interface BayteSelectionProps {
    /**
     * The studio's WhatsApp number, digits only. Without one the selection
     * still works, but it can't be sent yet.
     */
    whatsappNumber: string | null;
}

/** How long "Added …" shows on the button before it reads as the list again. */
const ADDED_NOTICE_MS = 1800;
/** How long a removed piece can be put back. */
const UNDO_MS = 5000;
/** A settled ease-out, the one the catalogue cards move with. */
const EASE = [0.22, 1, 0.36, 1] as const;

/** WhatsApp's speech-bubble mark, drawn in the current colour. */
function WhatsAppGlyph({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            fill="currentColor"
            className={className}
        >
            <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.14-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35ZM12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.31l-.34-.2-3.57.93.95-3.48-.22-.36a9.44 9.44 0 0 1-1.44-5.03c0-5.2 4.24-9.44 9.45-9.44 2.52 0 4.9.99 6.68 2.77a9.38 9.38 0 0 1 2.76 6.68c0 5.21-4.24 9.44-9.45 9.44Zm8.04-17.48A11.3 11.3 0 0 0 12.05.68C5.78.68.68 5.78.68 12.04c0 2 .52 3.96 1.52 5.68L.58 23.6l6.02-1.58a11.33 11.33 0 0 0 5.44 1.39h.01c6.26 0 11.36-5.1 11.36-11.37 0-3.04-1.18-5.89-3.33-8.03Z" />
        </svg>
    );
}

/**
 * The visitor's BAYTÉ selection: a button that floats over the catalogue once
 * something is in it, and the panel it opens — a drawer from the right on a
 * tablet up, a sheet from the bottom on a phone. Nothing is bought here: the
 * panel ends in a WhatsApp chat with the list already typed, asking the
 * studio for details.
 */
export default function BayteSelection({
    whatsappNumber,
}: BayteSelectionProps) {
    const selection = useBayteSelection();
    const reducedMotion = useReducedMotion();
    const [open, setOpen] = useState(false);
    const [sent, setSent] = useState(false);
    const [note, setNote] = useState('');
    const [name, setName] = useState(readSavedName);
    const [added, setAdded] = useState<string | null>(null);
    const [removed, setRemoved] = useState<{
        piece: SelectedPiece;
        index: number;
    } | null>(null);
    const dialog = useRef<HTMLDialogElement>(null);
    const previous = useRef(selection);

    // A new piece in the list — from this tab or another — reads as "Added …"
    // on the button for a moment, so the tap is answered where the eye goes.
    useEffect(() => {
        const newest = selection.find(
            (piece) => !previous.current.some((old) => old.slug === piece.slug),
        );
        previous.current = selection;

        if (!newest || open) {
            return;
        }

        setAdded(newest.name);
        const timer = setTimeout(() => setAdded(null), ADDED_NOTICE_MS);

        return () => clearTimeout(timer);
    }, [selection, open]);

    // The undo offer runs out on its own.
    useEffect(() => {
        if (!removed) {
            return;
        }

        const timer = setTimeout(() => setRemoved(null), UNDO_MS);

        return () => clearTimeout(timer);
    }, [removed]);

    useEffect(() => {
        const panel = dialog.current;

        if (open && !panel?.open) {
            panel?.showModal();
        } else if (!open && panel?.open) {
            panel.close();
        }

        if (!open) {
            return;
        }

        // The page behind the panel stays put while it is open.
        const root = document.documentElement;
        const overflow = root.style.overflow;
        root.style.overflow = 'hidden';

        return () => {
            root.style.overflow = overflow;
        };
    }, [open]);

    const close = () => {
        setOpen(false);
        setSent(false);
        setRemoved(null);
    };

    const remove = (piece: SelectedPiece, index: number) => {
        bayteSelection.remove(piece.slug);
        setRemoved({ piece, index });
    };

    const count = selection.length;
    const message = buildEnquiryMessage(selection, note, name);

    const sendClassName =
        'flex min-h-13 w-full items-center justify-center gap-2.5 rounded-full bg-brand px-6 font-sans text-sm text-brand-foreground transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand';

    const send = () => {
        saveName(name);
        setSent(true);
    };

    const finish = () => {
        bayteSelection.clear();
        setNote('');
        close();
    };

    return (
        <>
            <AnimatePresence>
                {count > 0 && (
                    <motion.button
                        type="button"
                        onClick={() => setOpen(true)}
                        initial={
                            reducedMotion
                                ? { opacity: 0 }
                                : { opacity: 0, y: 24, scale: 0.94 }
                        }
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={
                            reducedMotion
                                ? { opacity: 0 }
                                : { opacity: 0, y: 24, scale: 0.94 }
                        }
                        transition={{ duration: 0.45, ease: EASE }}
                        aria-haspopup="dialog"
                        className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 flex h-14 items-center gap-3 rounded-full bg-ink py-2 pr-5 pl-2 font-sans text-sm text-white shadow-[0_18px_40px_-16px_rgb(26_22_20/0.6)] transition-colors hover:bg-ink/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand md:right-8 md:bottom-8"
                    >
                        {/* The last few pieces, overlapping like a hand of cards. */}
                        <span aria-hidden="true" className="flex -space-x-3">
                            {selection
                                .slice(-3)
                                .reverse()
                                .map((piece) => (
                                    <span
                                        key={piece.slug}
                                        className="grid size-10 place-items-center overflow-hidden rounded-full bg-surface ring-2 ring-ink"
                                    >
                                        <img
                                            src={piece.image}
                                            alt=""
                                            className="size-full scale-90 object-contain"
                                            draggable={false}
                                        />
                                    </span>
                                ))}
                        </span>

                        <span className="grid text-left leading-tight">
                            <AnimatePresence mode="popLayout" initial={false}>
                                <motion.span
                                    key={added ?? 'selection'}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.25, ease: EASE }}
                                    className="max-w-40 truncate"
                                >
                                    {added ? (
                                        <>
                                            <Check
                                                aria-hidden="true"
                                                className="mr-1 inline size-3.5 align-[-2px] text-brand"
                                                strokeWidth={3}
                                            />
                                            Added {added}
                                        </>
                                    ) : (
                                        'Your selection'
                                    )}
                                </motion.span>
                            </AnimatePresence>
                            <span className="text-xs text-white/60">
                                {count} {count === 1 ? 'piece' : 'pieces'} ·{' '}
                                {whatsappNumber ? 'Ask on WhatsApp' : 'View'}
                            </span>
                        </span>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Screen readers hear each addition without the button moving focus. */}
            <p aria-live="polite" className="sr-only">
                {added && `${added} added to your selection.`}
            </p>

            <dialog
                ref={dialog}
                aria-labelledby="bayte-selection-title"
                onClose={close}
                // A tap on the backdrop lands on the dialog element itself.
                onClick={(event) => {
                    if (event.target === event.currentTarget) {
                        close();
                    }
                }}
                className={cn(
                    // A phone: a sheet from the bottom.
                    'fixed inset-x-0 top-auto bottom-0 m-0 flex max-h-[88dvh] w-full max-w-none translate-y-full flex-col rounded-t-3xl bg-white p-0 text-ink shadow-[0_-20px_50px_-30px_rgb(26_22_20/0.5)] open:translate-y-0 starting:open:translate-y-full',
                    // A tablet up: a drawer from the right.
                    'md:inset-y-0 md:right-0 md:left-auto md:h-dvh md:max-h-none md:w-[27rem] md:translate-x-full md:translate-y-0 md:rounded-t-none md:rounded-l-3xl md:open:translate-x-0 md:starting:open:translate-x-full md:starting:open:translate-y-0',
                    'transition-[translate,display,overlay] transition-discrete duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] not-open:hidden backdrop:bg-ink/40 motion-reduce:transition-none',
                )}
            >
                <span
                    aria-hidden="true"
                    className="mx-auto mt-2.5 block h-1 w-10 shrink-0 rounded-full bg-ink/15 md:hidden"
                />

                <header className="flex shrink-0 items-start justify-between gap-4 px-5 pt-3 pb-4 md:px-7 md:pt-7">
                    <div>
                        <h2
                            id="bayte-selection-title"
                            className="font-display text-lg text-ink"
                        >
                            Your selection
                        </h2>
                        <p className="mt-1.5 font-sans text-sm text-ink/55">
                            {count === 0
                                ? 'Nothing here yet.'
                                : `${count} ${count === 1 ? 'piece' : 'pieces'} you'd like to know more about.`}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={close}
                        aria-label="Close"
                        className="-mt-1 -mr-2 grid size-10 shrink-0 place-items-center rounded-full text-ink/60 transition-colors hover:bg-ink/5 hover:text-ink focus-visible:outline-2 focus-visible:outline-brand"
                    >
                        <X className="size-5" strokeWidth={1.75} />
                    </button>
                </header>

                {sent ? (
                    <div className="flex flex-1 flex-col items-center justify-center px-7 py-10 text-center font-sans">
                        <span className="grid size-14 place-items-center rounded-full bg-[#25d366]/12 text-[#1da851]">
                            <WhatsAppGlyph className="size-7" />
                        </span>
                        <p className="mt-5 font-display text-base text-ink">
                            Your message is ready
                        </p>
                        <p className="mt-2 max-w-72 text-sm leading-relaxed text-ink/60">
                            Press send in WhatsApp and the studio will get back
                            to you with the details.
                        </p>
                        <div className="mt-8 grid w-full max-w-72 gap-2">
                            <button
                                type="button"
                                onClick={finish}
                                className="inline-flex min-h-12 items-center justify-center rounded-full bg-brand px-6 text-sm text-brand-foreground transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                            >
                                Done, clear my selection
                            </button>
                            <button
                                type="button"
                                onClick={() => setSent(false)}
                                className="inline-flex min-h-12 items-center justify-center rounded-full border border-ink/15 px-6 text-sm text-ink transition-colors hover:border-ink/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                            >
                                Keep it for later
                            </button>
                        </div>
                        {whatsappNumber && (
                            <a
                                href={whatsappUrl(whatsappNumber, message)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-6 text-xs text-ink/50 underline underline-offset-4 transition-colors hover:text-ink"
                            >
                                WhatsApp didn't open? Try again
                            </a>
                        )}
                    </div>
                ) : count === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center px-7 py-12 text-center font-sans">
                        <span className="grid size-12 place-items-center rounded-full bg-brand text-brand-foreground">
                            <Plus className="size-5" strokeWidth={2.5} />
                        </span>
                        <p className="mt-5 max-w-64 text-sm leading-relaxed text-ink/60">
                            Tap the + on any piece to add it here, then send the
                            list to us on WhatsApp.
                        </p>
                        <button
                            type="button"
                            onClick={close}
                            className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full border border-ink/15 px-6 text-sm text-ink transition-colors hover:border-ink/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                        >
                            Browse the collection
                            <ArrowRight className="size-4" strokeWidth={1.75} />
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="min-h-0 flex-1 [scrollbar-width:thin] overflow-y-auto overscroll-contain px-5 md:px-7">
                            <ul className="grid gap-2">
                                <AnimatePresence initial={false}>
                                    {selection.map((piece, index) => (
                                        <motion.li
                                            key={piece.slug}
                                            layout={!reducedMotion}
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{
                                                opacity: 1,
                                                height: 'auto',
                                            }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{
                                                duration: 0.3,
                                                ease: EASE,
                                            }}
                                            className="overflow-hidden"
                                        >
                                            <div className="flex items-center gap-4 rounded-2xl bg-surface p-2.5 pr-2">
                                                <img
                                                    src={piece.image}
                                                    alt=""
                                                    loading="lazy"
                                                    draggable={false}
                                                    className="size-16 shrink-0 rounded-xl bg-white object-contain p-1"
                                                />
                                                <div className="min-w-0 flex-1 font-sans">
                                                    <p className="truncate text-sm text-ink">
                                                        {piece.name}
                                                    </p>
                                                    {piece.description && (
                                                        <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-ink/55">
                                                            {piece.description}
                                                        </p>
                                                    )}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        remove(piece, index)
                                                    }
                                                    aria-label={`Remove ${piece.name}`}
                                                    className="grid size-10 shrink-0 place-items-center rounded-full text-ink/45 transition-colors hover:bg-white hover:text-ink focus-visible:outline-2 focus-visible:outline-brand"
                                                >
                                                    <X
                                                        className="size-4"
                                                        strokeWidth={2}
                                                    />
                                                </button>
                                            </div>
                                        </motion.li>
                                    ))}
                                </AnimatePresence>
                            </ul>

                            <div className="mt-4 flex min-h-9 items-center justify-between gap-3 font-sans text-xs">
                                {removed ? (
                                    <p className="truncate text-ink/60">
                                        Removed {removed.piece.name} ·{' '}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                bayteSelection.restore(
                                                    removed.piece,
                                                    removed.index,
                                                );
                                                setRemoved(null);
                                            }}
                                            className="text-brand underline underline-offset-4 hover:text-brand-hover"
                                        >
                                            Undo
                                        </button>
                                    </p>
                                ) : (
                                    <p className="text-ink/45">
                                        {count >= SELECTION_LIMIT
                                            ? `That's the most one message can hold (${SELECTION_LIMIT}).`
                                            : 'Nothing is bought here — we just reply with details.'}
                                    </p>
                                )}
                                <button
                                    type="button"
                                    onClick={() => {
                                        bayteSelection.clear();
                                        setRemoved(null);
                                    }}
                                    className="shrink-0 text-ink/50 underline-offset-4 transition-colors hover:text-ink hover:underline"
                                >
                                    Clear all
                                </button>
                            </div>

                            <div className="mt-5 grid gap-3 pb-5 font-sans">
                                <label className="grid gap-1.5">
                                    <span className="text-xs text-ink/60">
                                        Your name{' '}
                                        <span className="text-ink/40">
                                            (optional)
                                        </span>
                                    </span>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(event) =>
                                            setName(event.target.value)
                                        }
                                        autoComplete="name"
                                        maxLength={60}
                                        className="h-11 rounded-xl border border-ink/15 bg-white px-3.5 text-base text-ink transition-colors placeholder:text-ink/40 hover:border-ink/30 focus:border-brand focus:outline-none focus-visible:ring-3 focus-visible:ring-brand/20 md:text-sm"
                                    />
                                </label>
                                <label className="grid gap-1.5">
                                    <span className="text-xs text-ink/60">
                                        A note for the studio{' '}
                                        <span className="text-ink/40">
                                            (optional)
                                        </span>
                                    </span>
                                    <textarea
                                        value={note}
                                        onChange={(event) =>
                                            setNote(event.target.value)
                                        }
                                        rows={2}
                                        maxLength={500}
                                        placeholder="Sizes, finishes, where it's going…"
                                        className="field-sizing-content min-h-20 resize-none rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-base text-ink transition-colors placeholder:text-ink/40 hover:border-ink/30 focus:border-brand focus:outline-none focus-visible:ring-3 focus-visible:ring-brand/20 md:text-sm"
                                    />
                                </label>
                            </div>
                        </div>

                        <footer className="shrink-0 border-t border-ink/8 px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] md:px-7 md:pb-7">
                            {whatsappNumber ? (
                                // A real link, so no popup blocker stands
                                // between the tap and WhatsApp.
                                <a
                                    href={whatsappUrl(whatsappNumber, message)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={send}
                                    className={sendClassName}
                                >
                                    <WhatsAppGlyph className="size-5" />
                                    Ask about{' '}
                                    {count === 1
                                        ? 'this piece'
                                        : `these ${count} pieces`}
                                </a>
                            ) : (
                                <button
                                    type="button"
                                    disabled
                                    className={cn(
                                        sendClassName,
                                        'cursor-not-allowed opacity-45 hover:bg-brand',
                                    )}
                                >
                                    <WhatsAppGlyph className="size-5" />
                                    Ask about{' '}
                                    {count === 1
                                        ? 'this piece'
                                        : `these ${count} pieces`}
                                </button>
                            )}
                            <p className="mt-2.5 text-center font-sans text-xs text-ink/45">
                                {whatsappNumber
                                    ? 'Opens WhatsApp with your list ready to send.'
                                    : 'Sending on WhatsApp is unavailable right now. Your selection is saved.'}
                            </p>
                        </footer>
                    </>
                )}
            </dialog>
        </>
    );
}
