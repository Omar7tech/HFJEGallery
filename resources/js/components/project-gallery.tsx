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

/**
 * The project's photos as a grid of lightweight thumbnails; the first one
 * leads at double size. Tapping any photo opens it in the full-screen viewer.
 */
export default function ProjectGallery({
    images,
    projectName,
}: ProjectGalleryProps) {
    const [open, setOpen] = useState<number | null>(null);
    const count = images.length;

    const describe = (index: number) =>
        `${projectName}, photo ${index + 1} of ${count}`;

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
