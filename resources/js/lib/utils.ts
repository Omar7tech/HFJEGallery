import type { ClassValue } from 'clsx';
import { clsx } from 'clsx';
import type { MouseEvent } from 'react';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * A plain left click, the only one a link should take over; new-tab and
 * modified clicks are left to the browser.
 */
export function isPlainClick(event: MouseEvent): boolean {
    return (
        event.button === 0 &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.shiftKey &&
        !event.altKey
    );
}
