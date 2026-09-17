import { Check, Copy } from 'lucide-react';
import { forwardRef, useEffect, useRef, useState } from 'react';
import { dominantColor } from '@/lib/dominant-color';
import { cn } from '@/lib/utils';
import type { MoodBoardImage, MoodBoardSlot } from '@/types';
import type { MoodBoardStatus } from './use-mood-board';

/** Rendered widths of the positions, so the browser downloads the 480px version when it is enough. */
const LARGE_SIZES = '(min-width: 1024px) 18rem, 52vw';
const MEDIUM_SIZES = '(min-width: 1024px) 16rem, 46vw';
const SMALL_SIZES = '(min-width: 1024px) 6rem, 15vw';

/** Swatch colours used until the board images give their own. */
const DEFAULT_DARK_SWATCH = '#6c4936';
const DEFAULT_LIGHT_SWATCH = '#d6c2a6';

function BoardImage({
    image,
    sizes,
    isPending,
    className,
    onColor,
}: {
    image: MoodBoardImage | null | undefined;
    sizes: string;
    isPending: boolean;
    className: string;
    onColor?: (url: string, color: string | null) => void;
}) {
    const [loadedUrl, setLoadedUrl] = useState<string | null>(null);
    const isLoaded = image !== null && image?.url === loadedUrl;

    return (
        <div
            className={cn(
                'relative min-h-0 overflow-hidden bg-[#dedede]',
                className,
                (isPending || (image && !isLoaded)) &&
                    'motion-safe:animate-pulse',
            )}
        >
            {image && (
                <img
                    key={image.url}
                    src={image.thumbUrl}
                    srcSet={`${image.thumbUrl} 480w, ${image.url} 1920w`}
                    sizes={sizes}
                    alt={image.alt}
                    decoding="async"
                    draggable={false}
                    onLoad={(event) => {
                        setLoadedUrl(image.url);
                        onColor?.(
                            image.url,
                            dominantColor(event.currentTarget),
                        );
                    }}
                    className={cn(
                        'absolute inset-0 size-full object-cover transition-opacity duration-500 motion-reduce:transition-none',
                        isLoaded ? 'opacity-100' : 'opacity-0',
                    )}
                />
            )}
        </div>
    );
}

/** How long the "Copied" confirmation stays visible. */
const COPIED_FEEDBACK_MS = 1600;

/** Whether dark text reads better than white text on a hex colour (relative luminance). */
function prefersDarkText(hex: string): boolean {
    const [red, green, blue] = [1, 3, 5].map((start) => {
        const channel = parseInt(hex.slice(start, start + 2), 16) / 255;

        return channel <= 0.03928
            ? channel / 12.92
            : ((channel + 0.055) / 1.055) ** 2.4;
    });

    return 0.2126 * red + 0.7152 * green + 0.0722 * blue > 0.4;
}

/**
 * A board colour swatch. Hovering or focusing it reveals the hex code, and clicking copies it.
 */
function ColorSwatch({
    color,
    isWaiting,
}: {
    color: string;
    isWaiting: boolean;
}) {
    const [copiedColor, setCopiedColor] = useState<string | null>(null);
    const timerRef = useRef<number | null>(null);
    const hex = color.toUpperCase();
    const isCopied = copiedColor === color;

    useEffect(
        () => () => {
            if (timerRef.current !== null) {
                window.clearTimeout(timerRef.current);
            }
        },
        [],
    );

    async function copy() {
        try {
            await navigator.clipboard.writeText(hex);
        } catch {
            return;
        }

        setCopiedColor(color);

        if (timerRef.current !== null) {
            window.clearTimeout(timerRef.current);
        }

        timerRef.current = window.setTimeout(
            () => setCopiedColor(null),
            COPIED_FEEDBACK_MS,
        );
    }

    return (
        <button
            type="button"
            onClick={copy}
            disabled={isWaiting}
            aria-label={isCopied ? `Copied ${hex}` : `Copy colour ${hex}`}
            title={isWaiting ? undefined : `Copy ${hex}`}
            style={{ backgroundColor: color }}
            className={cn(
                'group relative min-w-0 overflow-hidden rounded-xl transition-colors duration-700 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-default motion-reduce:transition-none',
                prefersDarkText(color) ? 'text-[#191b17]' : 'text-white',
                isWaiting ? 'motion-safe:animate-pulse' : 'cursor-copy',
            )}
        >
            <span
                className={cn(
                    'absolute inset-0 flex items-center justify-center gap-1 bg-black/10 px-1 text-[10px] font-medium tracking-wide transition-opacity duration-200 motion-reduce:transition-none',
                    isCopied
                        ? 'opacity-100'
                        : 'opacity-0 group-focus-visible:opacity-100 group-hover:group-enabled:opacity-100',
                )}
            >
                {isCopied ? (
                    <>
                        <Check aria-hidden="true" size={12} />
                        Copied
                    </>
                ) : (
                    <>
                        <Copy
                            aria-hidden="true"
                            size={12}
                            className="shrink-0"
                        />
                        <span className="truncate">{hex}</span>
                    </>
                )}
            </span>
        </button>
    );
}

const STATUS_MESSAGES: Record<MoodBoardStatus, string> = {
    empty: '',
    loading: 'Creating your mood board.',
    ready: 'Your mood board is ready.',
    stale: 'Your choices changed. Update the mood board to match them.',
    failed: 'Your mood board could not be loaded.',
};

/**
 * The mood board layout: one large, one square and three small image positions, plus the brand
 * colour swatches. Grey placeholders stand in until a board is shown.
 */
const MoodBoardPreview = forwardRef<
    HTMLDivElement,
    {
        slots: MoodBoardSlot[] | null;
        status: MoodBoardStatus;
    }
>(function MoodBoardPreview({ slots, status }, ref) {
    const imageAt = (slot: number) =>
        slots?.find((entry) => entry.slot === slot)?.image;
    const isPending = status === 'loading' && slots === null;

    /** Colours read from loaded images, keyed by image URL. Null when an image cannot be read. */
    const [colors, setColors] = useState<Record<string, string | null>>({});
    const rememberColor = (url: string, color: string | null) =>
        setColors((current) => ({ ...current, [url]: color }));

    /** A swatch takes its image colour, and pulses while that colour is still unknown. */
    const swatch = (
        image: MoodBoardImage | null | undefined,
        fallback: string,
    ) => ({
        color: (image && colors[image.url]) || fallback,
        isWaiting:
            status === 'loading' || (image != null && !(image.url in colors)),
    });
    const darkSwatch = swatch(imageAt(1), DEFAULT_DARK_SWATCH);
    const lightSwatch = swatch(imageAt(2), DEFAULT_LIGHT_SWATCH);

    return (
        <div ref={ref} className="mt-6 scroll-mt-6">
            <div
                role="group"
                aria-label="Mood board preview"
                aria-busy={status === 'loading'}
                className={cn(
                    'grid aspect-square grid-cols-[1.1fr_1fr] gap-1.5 transition-opacity duration-300 motion-reduce:transition-none',
                    status === 'loading' && slots !== null && 'opacity-70',
                )}
            >
                <BoardImage
                    image={imageAt(1)}
                    sizes={LARGE_SIZES}
                    isPending={isPending}
                    className="rounded-xl"
                    onColor={rememberColor}
                />
                <div className="grid min-h-0 grid-rows-[1.65fr_1fr_0.7fr] gap-1.5">
                    <BoardImage
                        image={imageAt(2)}
                        sizes={MEDIUM_SIZES}
                        isPending={isPending}
                        className="rounded-xl"
                        onColor={rememberColor}
                    />
                    <div className="grid grid-cols-[2fr_1fr] gap-1">
                        <ColorSwatch
                            color={darkSwatch.color}
                            isWaiting={darkSwatch.isWaiting}
                        />
                        <ColorSwatch
                            color={lightSwatch.color}
                            isWaiting={lightSwatch.isWaiting}
                        />
                    </div>
                    <div className="grid min-h-0 grid-cols-3 gap-1">
                        {[3, 4, 5].map((slot) => (
                            <BoardImage
                                key={slot}
                                image={imageAt(slot)}
                                sizes={SMALL_SIZES}
                                isPending={isPending}
                                className="rounded-lg"
                            />
                        ))}
                    </div>
                </div>
            </div>

            <p className="sr-only" role="status">
                {STATUS_MESSAGES[status]}
            </p>
        </div>
    );
});

export default MoodBoardPreview;
