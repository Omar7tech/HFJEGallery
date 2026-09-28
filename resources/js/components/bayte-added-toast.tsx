import { Link } from '@inertiajs/react';
import { ArrowRight, Check, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { useBayteSelection } from '@/lib/bayte-selection';

/** Long enough to read and reach the link, short enough not to linger. */
const VISIBLE_MS = 4500;
const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * A short note that answers a "+" away from the catalogue: the piece is in
 * the selection, and the selection lives on the BAYTÉ page.
 */
export default function BayteAddedToast() {
    const selection = useBayteSelection();
    const reducedMotion = useReducedMotion();
    const [added, setAdded] = useState<{ name: string; nonce: number } | null>(
        null,
    );
    const previous = useRef(selection);
    const nonce = useRef(0);

    // Only a piece new to the list speaks up; a removal stays quiet.
    useEffect(() => {
        const newest = selection.find(
            (piece) => !previous.current.some((old) => old.slug === piece.slug),
        );
        previous.current = selection;

        if (newest) {
            setAdded({ name: newest.name, nonce: ++nonce.current });
        }
    }, [selection]);

    useEffect(() => {
        if (!added) {
            return;
        }

        const timer = setTimeout(() => setAdded(null), VISIBLE_MS);

        return () => clearTimeout(timer);
    }, [added]);

    const count = selection.length;

    return (
        <div
            aria-live="polite"
            className="pointer-events-none fixed inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 flex justify-center md:inset-x-auto md:right-8 md:bottom-8"
        >
            <AnimatePresence>
                {added && (
                    <motion.div
                        key={added.nonce}
                        initial={
                            reducedMotion
                                ? { opacity: 0 }
                                : { opacity: 0, y: 20, scale: 0.96 }
                        }
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={
                            reducedMotion
                                ? { opacity: 0 }
                                : { opacity: 0, y: 12, scale: 0.98 }
                        }
                        transition={{ duration: 0.4, ease: EASE }}
                        className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl bg-ink py-3 pr-2 pl-4 font-sans text-sm text-white shadow-[0_18px_40px_-16px_rgb(26_22_20/0.6)]"
                    >
                        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand text-brand-foreground">
                            <Check className="size-4" strokeWidth={2.5} />
                        </span>
                        <div className="min-w-0 flex-1 leading-tight">
                            <p className="truncate">
                                {added.name} added to your selection
                            </p>
                            <Link
                                href="/bayte"
                                className="group mt-1 inline-flex items-center gap-1 text-xs text-white/65 underline-offset-4 transition-colors hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-brand"
                            >
                                See {count === 1 ? 'it' : `all ${count}`} on the
                                BAYTÉ page
                                <ArrowRight
                                    aria-hidden="true"
                                    className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none"
                                    strokeWidth={1.75}
                                />
                            </Link>
                        </div>
                        <button
                            type="button"
                            onClick={() => setAdded(null)}
                            aria-label="Dismiss"
                            className="grid size-9 shrink-0 place-items-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-brand"
                        >
                            <X className="size-4" strokeWidth={2} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
