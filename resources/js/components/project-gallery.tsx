import { LayoutGrid } from 'lucide-react';
import { useState } from 'react';
import ProjectLightbox from '@/components/project-lightbox';
import { SmartImage } from '@/components/smart-image';
import { cn } from '@/lib/utils';
import type { ProjectImage } from '@/types';

interface ProjectGalleryProps {
    images: ProjectImage[];
    /** Used to describe each photo, e.g. "Broummana House, photo 2 of 6". */
    projectName: string;
}

/** Photos shown in the mosaic; the rest wait in the full-screen viewer. */
const MOSAIC_SIZE = 5;

/**
 * Where each mosaic tile sits on the 4 × 2 grid, by how many tiles there are.
 * The lead photo always takes the left half when there is more than one.
 */
const MOSAIC_LAYOUTS: Record<number, string[]> = {
    1: ['col-span-4 row-span-2'],
    2: ['col-span-2 row-span-2', 'col-span-2 row-span-2'],
    3: ['col-span-2 row-span-2', 'col-span-2', 'col-span-2'],
    4: ['col-span-2 row-span-2', 'col-span-2', '', ''],
    5: ['col-span-2 row-span-2', '', '', '', ''],
};

/**
 * The project's photos, kept compact: a fixed-height mosaic of the first few
 * on wider screens and a swipeable strip on phones. Any photo, or the "show
 * all" button, opens the full-screen viewer with every photo.
 */
export default function ProjectGallery({
    images,
    projectName,
}: ProjectGalleryProps) {
    const [open, setOpen] = useState<number | null>(null);
    const count = images.length;

    if (count === 0) {
        return null;
    }

    const describe = (index: number) =>
        `${projectName}, photo ${index + 1} of ${count}`;

    const mosaic = images.slice(0, MOSAIC_SIZE);
    const layout = MOSAIC_LAYOUTS[mosaic.length];

    return (
        <>
            {/* Phones: one swipeable row, each photo peeking at the next. */}
            <div className="nav-scroll -mx-5 flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 pb-2 md:-mx-8 md:scroll-px-8 md:px-8 @3xl:hidden">
                {images.map((image, index) => (
                    <button
                        data-no-press
                        key={image.src}
                        type="button"
                        onClick={() => setOpen(index)}
                        aria-label={`Open ${describe(index)}`}
                        className="block w-[82%] shrink-0 snap-start rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand @md:w-[60%]"
                    >
                        <SmartImage
                            src={image.thumb}
                            alt={describe(index)}
                            className="aspect-4/3 rounded-2xl"
                            imgClassName="object-cover"
                        />
                    </button>
                ))}
            </div>

            {/* Wider screens: a mosaic of fixed height, however many photos. */}
            <div className="relative hidden @3xl:block">
                <div className="grid h-[clamp(22rem,40cqi,34rem)] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-3xl md:rounded-[36px]">
                    {mosaic.map((image, index) => {
                        const wide = layout[index].includes('col-span-2');

                        return (
                            <button
                                data-no-press
                                key={image.src}
                                type="button"
                                onClick={() => setOpen(index)}
                                aria-label={`Open ${describe(index)}`}
                                className={cn(
                                    'group relative block min-h-0 cursor-zoom-in overflow-hidden focus-visible:z-10 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-brand',
                                    layout[index],
                                )}
                            >
                                <SmartImage
                                    // Tiles spanning half the width get the full-size file.
                                    src={wide ? image.src : image.thumb}
                                    alt={describe(index)}
                                    className="size-full"
                                    imgClassName="object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                                >
                                    <span
                                        aria-hidden="true"
                                        className="pointer-events-none absolute inset-0 bg-ink/0 transition-colors duration-300 group-hover:bg-ink/10"
                                    />
                                </SmartImage>
                            </button>
                        );
                    })}
                </div>

                {count > 1 && (
                    <button
                        type="button"
                        onClick={() => setOpen(0)}
                        className="absolute right-4 bottom-4 inline-flex min-h-10 items-center gap-2 rounded-full bg-white/95 px-4 font-sans text-sm text-ink shadow-[0_10px_30px_-12px_rgb(0_0_0/0.35)] ring-1 ring-ink/10 backdrop-blur transition-colors duration-200 hover:bg-white hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    >
                        <LayoutGrid className="size-4" strokeWidth={1.75} />
                        Show all photos
                    </button>
                )}
            </div>

            <ProjectLightbox
                images={images}
                projectName={projectName}
                index={open}
                onIndexChange={setOpen}
                onClose={() => setOpen(null)}
            />
        </>
    );
}
