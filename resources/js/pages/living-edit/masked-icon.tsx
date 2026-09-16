import { cn } from '@/lib/utils';

// Paints an uploaded transparent icon with the current text color, so it follows selected/hover states.
export default function MaskedIcon({
    src,
    className,
}: {
    src: string;
    className?: string;
}) {
    const mask = `url("${src}") center / contain no-repeat`;

    return (
        <span
            aria-hidden="true"
            className={cn('block bg-current', className)}
            style={{ mask, WebkitMask: mask }}
        />
    );
}
