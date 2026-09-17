import { forwardRef, useState } from 'react';
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
                    <div
                        className="grid grid-cols-[2fr_1fr] gap-1"
                        aria-hidden="true"
                    >
                        {[darkSwatch, lightSwatch].map((swatch, index) => (
                            <div
                                key={index}
                                style={{ backgroundColor: swatch.color }}
                                className={cn(
                                    'rounded-xl transition-colors duration-700 ease-out motion-reduce:transition-none',
                                    swatch.isWaiting &&
                                        'motion-safe:animate-pulse',
                                )}
                            />
                        ))}
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
