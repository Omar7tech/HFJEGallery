import { Lock, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { MoodBoardImage, MoodBoardSlot } from '@/types';
import type { MoodBoardStatus } from './use-mood-board';

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

const STATUS_MESSAGES: Record<MoodBoardStatus, string> = {
    locked: '',
    loading: 'Building your mood board.',
    ready: 'Your mood board is ready.',
    stale: 'Your choices changed. Update the board to see matching images.',
    failed: 'Your mood board could not be loaded.',
};

function BoardOverlay({
    status,
    lastStepNumber,
    onRefresh,
}: {
    status: MoodBoardStatus;
    lastStepNumber: number;
    onRefresh: () => void;
}) {
    if (status === 'locked') {
        return (
            <div className="absolute inset-0 flex items-center justify-center p-6">
                <div className="flex max-w-[15rem] flex-col items-center gap-2 rounded-2xl bg-white/85 px-5 py-4 text-center shadow-[0_3px_12px_rgba(0,0,0,0.08)] backdrop-blur-sm">
                    <Lock
                        aria-hidden="true"
                        size={18}
                        className="text-[#ad6844]"
                    />
                    <p className="text-sm leading-snug text-[#191b17]">
                        Your mood board appears at step {lastStepNumber}
                    </p>
                    <p className="text-[11px] leading-snug text-[#777]">
                        Every choice you make shapes the images we match for
                        you.
                    </p>
                </div>
            </div>
        );
    }

    if (status === 'stale' || status === 'failed') {
        return (
            <div className="absolute inset-0 flex items-center justify-center p-6">
                <div className="flex max-w-[15rem] flex-col items-center gap-3 rounded-2xl bg-white/90 px-5 py-4 text-center shadow-[0_3px_12px_rgba(0,0,0,0.12)] backdrop-blur-sm">
                    <p className="text-sm leading-snug text-[#191b17]">
                        {status === 'stale'
                            ? 'Your choices changed'
                            : 'We could not load your board'}
                    </p>
                    <button
                        type="button"
                        onClick={onRefresh}
                        className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-[#ad6844] px-4 py-1.5 text-xs text-white transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    >
                        <RefreshCw aria-hidden="true" size={14} />
                        {status === 'stale' ? 'Update board' : 'Try again'}
                    </button>
                </div>
            </div>
        );
    }

    return null;
}

/**
 * The mood board layout with the matched images: one large, one square and three small
 * positions, plus the brand colour swatches.
 */
export default function MoodBoardPreview({
    slots,
    status,
    lastStepNumber,
    onRefresh,
}: {
    slots: MoodBoardSlot[] | null;
    status: MoodBoardStatus;
    lastStepNumber: number;
    onRefresh: () => void;
}) {
    const imageAt = (slot: number) =>
        slots?.find((entry) => entry.slot === slot)?.image;
    const isPending = status === 'loading' && slots === null;
    const isDimmed = status !== 'ready' && status !== 'locked';

    return (
        <div className="relative mt-6">
            <div
                role="group"
                aria-label="Mood board preview"
                aria-busy={status === 'loading'}
                className={cn(
                    'grid aspect-square grid-cols-[1.1fr_1fr] gap-1.5 transition-[opacity,filter] duration-300 motion-reduce:transition-none',
                    isDimmed && slots !== null && 'opacity-60 saturate-50',
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

            <BoardOverlay
                status={status}
                lastStepNumber={lastStepNumber}
                onRefresh={onRefresh}
            />

            <p className="sr-only" role="status">
                {STATUS_MESSAGES[status]}
            </p>
        </div>
    );
}
