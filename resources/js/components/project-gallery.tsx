import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { SmartImage } from '@/components/smart-image';
import { cn } from '@/lib/utils';
import type { ProjectImage } from '@/types';

interface ProjectGalleryProps {
    images: ProjectImage[];
    /** Used to describe each photo, e.g. "Broummana House, photo 2 of 6". */
    projectName: string;
}

/**
 * The project's photos as a grid of lightweight thumbnails; the first one
 * leads at double size. Tapping any photo opens it full size in a lightbox
 * that steps through the set with the arrows, the arrow keys or a swipe-free
 * tap on either side, and closes on Escape or a click outside the photo.
 */
export default function ProjectGallery({
    images,
    projectName,
}: ProjectGalleryProps) {
    const [open, setOpen] = useState<number | null>(null);
    const count = images.length;

    const describe = (index: number) =>
        `${projectName}, photo ${index + 1} of ${count}`;

    const step = useCallback(
        (direction: 1 | -1) =>
            setOpen((current) =>
                current === null ? null : (current + direction + count) % count,
            ),
        [count],
    );

    useEffect(() => {
        if (open === null) {
            return;
        }

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setOpen(null);
            } else if (event.key === 'ArrowRight') {
                step(1);
            } else if (event.key === 'ArrowLeft') {
                step(-1);
            }
        };

        document.documentElement.style.overflow = 'hidden';
        window.addEventListener('keydown', onKeyDown);

        return () => {
            document.documentElement.style.overflow = '';
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [open, step]);

    if (count === 0) {
        return null;
    }

    return (
        <>
            <div className="grid grid-cols-2 gap-3 @3xl:grid-cols-3 @3xl:gap-4">
                {images.map((image, index) => (
                    <button
                        key={image.src}
                        type="button"
                        onClick={() => setOpen(index)}
                        aria-label={`Open ${describe(index)}`}
                        className={cn(
                            'group block cursor-zoom-in rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand',
                            index === 0 && 'col-span-2 row-span-2',
                        )}
                    >
                        <SmartImage
                            // The lead photo is shown large, so it gets the full-size file.
                            src={index === 0 ? image.src : image.thumb}
                            alt={describe(index)}
                            className={cn(
                                'rounded-2xl @3xl:rounded-3xl',
                                index === 0
                                    ? 'aspect-4/3 h-full'
                                    : 'aspect-4/3',
                            )}
                            imgClassName="object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                        />
                    </button>
                ))}
            </div>

            {open !== null && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label={describe(open)}
                    onClick={() => setOpen(null)}
                    className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/92 p-4 md:p-10"
                >
                    <img
                        src={images[open].src}
                        alt={describe(open)}
                        decoding="async"
                        onClick={(event) => event.stopPropagation()}
                        className="max-h-full max-w-full rounded-xl object-contain shadow-2xl"
                    />

                    <button
                        type="button"
                        onClick={() => setOpen(null)}
                        aria-label="Close gallery"
                        className="absolute top-4 right-4 grid size-11 place-items-center rounded-full bg-cream/10 text-cream transition-colors hover:bg-cream hover:text-brand"
                    >
                        <X className="size-5" strokeWidth={1.75} />
                    </button>

                    {count > 1 && (
                        <>
                            <button
                                type="button"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    step(-1);
                                }}
                                aria-label="Previous photo"
                                className="absolute top-1/2 left-3 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-cream/10 text-cream transition-colors hover:bg-cream hover:text-brand md:left-6"
                            >
                                <ChevronLeft
                                    className="size-5"
                                    strokeWidth={1.75}
                                />
                            </button>
                            <button
                                type="button"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    step(1);
                                }}
                                aria-label="Next photo"
                                className="absolute top-1/2 right-3 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-cream/10 text-cream transition-colors hover:bg-cream hover:text-brand md:right-6"
                            >
                                <ChevronRight
                                    className="size-5"
                                    strokeWidth={1.75}
                                />
                            </button>
                            <p className="absolute bottom-5 left-1/2 -translate-x-1/2 font-sans text-sm tracking-[0.15em] text-cream/70">
                                {open + 1} / {count}
                            </p>
                        </>
                    )}
                </div>
            )}
        </>
    );
}
