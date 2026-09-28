import { useSyncExternalStore } from 'react';

/** A piece the visitor wants to know more about. */
export interface SelectedPiece {
    slug: string;
    name: string;
    description: string;
    image: string;
}

const STORAGE_KEY = 'bayte-selection';
const NAME_STORAGE_KEY = 'bayte-selection-name';

/** Keeps the WhatsApp message, and its link, a sensible length. */
export const SELECTION_LIMIT = 30;

const EMPTY: SelectedPiece[] = [];

type Listener = () => void;

const listeners = new Set<Listener>();
let pieces: SelectedPiece[] | null = null;

function isSelectedPiece(value: unknown): value is SelectedPiece {
    if (typeof value !== 'object' || value === null) {
        return false;
    }

    const piece = value as Record<string, unknown>;

    return (
        typeof piece.slug === 'string' &&
        typeof piece.name === 'string' &&
        typeof piece.description === 'string' &&
        typeof piece.image === 'string'
    );
}

/** The saved selection; anything unreadable counts as an empty one. */
function readStored(): SelectedPiece[] {
    try {
        const parsed: unknown = JSON.parse(
            window.localStorage.getItem(STORAGE_KEY) ?? '[]',
        );

        return Array.isArray(parsed)
            ? parsed.filter(isSelectedPiece).slice(0, SELECTION_LIMIT)
            : [];
    } catch {
        return [];
    }
}

function current(): SelectedPiece[] {
    pieces ??= readStored();

    return pieces;
}

function commit(next: SelectedPiece[]): void {
    pieces = next;

    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
        // Private mode or a full quota: the selection still works for this visit.
    }

    listeners.forEach((listener) => listener());
}

/** Another tab changed the selection: pick it up here too. */
function onStorage(event: StorageEvent): void {
    if (event.key !== STORAGE_KEY && event.key !== null) {
        return;
    }

    pieces = readStored();
    listeners.forEach((listener) => listener());
}

function subscribe(listener: Listener): () => void {
    if (listeners.size === 0) {
        window.addEventListener('storage', onStorage);
    }

    listeners.add(listener);

    return () => {
        listeners.delete(listener);

        if (listeners.size === 0) {
            window.removeEventListener('storage', onStorage);
        }
    };
}

/**
 * The visitor's BAYTÉ selection: the pieces they want to ask about, kept in
 * this browser only. There are no quantities — a piece is in it or not.
 */
export const bayteSelection = {
    /** Adds the piece, or takes it out when it is already there. */
    toggle(piece: SelectedPiece): void {
        const list = current();

        if (list.some((item) => item.slug === piece.slug)) {
            commit(list.filter((item) => item.slug !== piece.slug));
        } else if (list.length < SELECTION_LIMIT) {
            commit([...list, piece]);
        }
    },

    remove(slug: string): void {
        commit(current().filter((item) => item.slug !== slug));
    },

    /** Puts a removed piece back where it was. */
    restore(piece: SelectedPiece, index: number): void {
        const list = current().filter((item) => item.slug !== piece.slug);

        commit([...list.slice(0, index), piece, ...list.slice(index)]);
    },

    clear(): void {
        commit([]);
    },
};

/** Every piece in the selection, in the order they were added. */
export function useBayteSelection(): SelectedPiece[] {
    return useSyncExternalStore(subscribe, current, () => EMPTY);
}

/** Whether one piece is in the selection; re-renders only when that changes. */
export function useIsSelected(slug: string): boolean {
    return useSyncExternalStore(
        subscribe,
        () => current().some((item) => item.slug === slug),
        () => false,
    );
}

/** The name the visitor signed their last message with, if any. */
export function readSavedName(): string {
    try {
        return window.localStorage.getItem(NAME_STORAGE_KEY) ?? '';
    } catch {
        return '';
    }
}

export function saveName(name: string): void {
    try {
        window.localStorage.setItem(NAME_STORAGE_KEY, name.trim());
    } catch {
        // Not worth interrupting the send over.
    }
}

/**
 * The message the visitor sends: the pieces by name, then their note and
 * name, in WhatsApp's `*bold*` markup so the studio can read it at a glance.
 */
export function buildEnquiryMessage(
    selection: SelectedPiece[],
    note: string,
    name: string,
): string {
    const lines = [
        selection.length === 1
            ? "Hello HFJE, I'd like to know more about this BAYTÉ piece:"
            : "Hello HFJE, I'd like to know more about these BAYTÉ pieces:",
        '',
        ...selection.map((piece, index) =>
            piece.description
                ? `${index + 1}. *${piece.name}* — ${piece.description}`
                : `${index + 1}. *${piece.name}*`,
        ),
    ];

    if (note.trim()) {
        lines.push('', `*Note:* ${note.trim()}`);
    }

    if (name.trim()) {
        lines.push('', `— ${name.trim()}`);
    }

    return lines.join('\n');
}

/** A wa.me link opening a chat with the message typed in, ready to send. */
export function whatsappUrl(number: string, message: string): string {
    return `https://wa.me/${number.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
}
