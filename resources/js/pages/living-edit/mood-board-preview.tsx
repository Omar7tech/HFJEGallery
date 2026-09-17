import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { MoodBoardImage, MoodBoardSlot } from '@/types';

/** Rendered widths of the positions, so the browser downloads the 480px version when it is enough. */
const LARGE_SIZES = '(min-width: 1024px) 18rem, 52vw';
const MEDIUM_SIZES = '(min-width: 1024px) 16rem, 46vw';
const SMALL_SIZES = '(min-width: 1024px) 6rem, 15vw';

function BoardImage({
    image,
    sizes,
    isPending,
    className,
}: {
    image: MoodBoardImage | null | undefined;
    sizes: string;
    isPending: boolean;
    className: string;
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
                    onLoad={() => setLoadedUrl(image.url)}
                    className={cn(
                        'absolute inset-0 size-full object-cover transition-opacity duration-500 motion-reduce:transition-none',
                        isLoaded ? 'opacity-100' : 'opacity-0',
                    )}
                />
            )}
        </div>
    );
}

/**
 * The mood board layout with the matched images: one large, one square and three small
 * positions, plus the brand colour swatches.
 */
export default function MoodBoardPreview({
    slots,
    isLoading,
}: {
    slots: MoodBoardSlot[] | null;
    isLoading: boolean;
}) {
    const imageAt = (slot: number) =>
        slots?.find((entry) => entry.slot === slot)?.image;
    const isPending = slots === null;

    return (
        <div
            role="group"
            aria-label="Mood board preview"
            aria-busy={isLoading}
            className={cn(
                'mt-6 grid aspect-square grid-cols-[1.1fr_1fr] gap-1.5 transition-opacity duration-300',
                isLoading && !isPending && 'opacity-80',
            )}
        >
            <BoardImage
                image={imageAt(1)}
                sizes={LARGE_SIZES}
                isPending={isPending}
                className="rounded-xl"
            />
            <div className="grid min-h-0 grid-rows-[1.65fr_1fr_0.7fr] gap-1.5">
                <BoardImage
                    image={imageAt(2)}
                    sizes={MEDIUM_SIZES}
                    isPending={isPending}
                    className="rounded-xl"
                />
                <div
                    className="grid grid-cols-[2fr_1fr] gap-1"
                    aria-hidden="true"
                >
                    <div className="rounded-xl bg-[#6c4936]" />
                    <div className="rounded-xl bg-[#d6c2a6]" />
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
    );
}
