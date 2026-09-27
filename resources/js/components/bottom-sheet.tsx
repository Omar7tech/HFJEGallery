import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';

interface BottomSheetProps {
    open: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
}

/**
 * A panel sliding up from the bottom of the screen, for choices on a phone.
 * Built on the native modal `<dialog>`: it traps focus, closes on Escape and
 * on a tap outside, and keeps the page behind it inert.
 */
export default function BottomSheet({
    open,
    onClose,
    title,
    children,
}: BottomSheetProps) {
    const dialog = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const sheet = dialog.current;

        if (open && !sheet?.open) {
            sheet?.showModal();
        } else if (!open && sheet?.open) {
            sheet.close();
        }
    }, [open]);

    return (
        <dialog
            ref={dialog}
            aria-label={title}
            onClose={onClose}
            // A tap on the backdrop lands on the dialog element itself.
            onClick={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
            className="fixed inset-x-0 top-auto bottom-0 m-0 max-h-[80dvh] w-full max-w-none translate-y-0 rounded-t-3xl bg-white p-0 text-ink shadow-[0_-20px_50px_-30px_rgb(26_22_20/0.5)] transition-[translate,display,overlay] transition-discrete duration-300 ease-out backdrop:bg-ink/40 motion-reduce:transition-none starting:open:translate-y-full"
        >
            {/* The grab handle every phone sheet shows. */}
            <span
                aria-hidden="true"
                className="mx-auto mt-2.5 block h-1 w-10 rounded-full bg-ink/15"
            />
            <div className="flex items-center justify-between px-5 pt-2 pb-1">
                <h2 className="font-display text-base text-ink">{title}</h2>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className="grid size-10 place-items-center rounded-full text-ink/60 transition-colors hover:bg-ink/5 hover:text-ink focus-visible:outline-2 focus-visible:outline-brand"
                >
                    <X className="size-5" strokeWidth={1.75} />
                </button>
            </div>
            <div className="[scrollbar-width:none] overflow-y-auto px-3 py-3 pb-[max(1rem,env(safe-area-inset-bottom))] [&::-webkit-scrollbar]:hidden">
                {children}
            </div>
        </dialog>
    );
}
