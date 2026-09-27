import { ChevronLeft, ChevronRight, Loader2, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { PanInfo } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { SmartImage } from '@/components/smart-image';
import { cn } from '@/lib/utils';
import type { ProjectImage } from '@/types';

interface ProjectLightboxProps {
    images: ProjectImage[];
    projectName: string;
    /** The photo on show, or null while the viewer is closed. */
    index: number | null;
    onIndexChange: (index: number) => void;
    onClose: () => void;
}

/** How far (px) or how fast (px/s) a swipe must travel to change photo. */
const SWIPE_DISTANCE = 80;
const SWIPE_VELOCITY = 500;

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Full-screen photo viewer for a project's gallery.
 *
 * A quiet frame: the project name and a counter on top, the photo in the
 * middle and a filmstrip of thumbnails underneath that keeps the current
 * photo centred. Photos slide in from the side they come from; swipe on
 * touch, click either half of the photo or use the arrow keys to move, and
 * Escape or the backdrop to close. The neighbours are fetched ahead of time
 * so stepping through never waits.
 */
export default function ProjectLightbox({
    images,
    projectName,
    index,
    onIndexChange,
    onClose,
}: ProjectLightboxProps) {
    const reducedMotion = useReducedMotion();
    const dialog = useRef<HTMLDivElement>(null);
    const filmstrip = useRef<HTMLDivElement>(null);
    const [direction, setDirection] = useState<1 | -1>(1);
    const [loaded, setLoaded] = useState<Record<string, boolean>>({});

    const count = images.length;
    const isOpen = index !== null;

    const go = (step: 1 | -1) => {
        if (index === null || count < 2) {
            return;
        }

        setDirection(step);
        onIndexChange((index + step + count) % count);
    };

    const jumpTo = (target: number) => {
        if (index === null || target === index) {
            return;
        }

        setDirection(target > index ? 1 : -1);
        onIndexChange(target);
    };

    // The key handler is bound once per opening, so it reads the latest
    // step / close functions through a ref instead of re-subscribing.
    const keys = useRef({ go, onClose });

    useEffect(() => {
        keys.current = { go, onClose };
    });

    // Scroll lock, focus and keyboard for as long as the viewer is open;
    // focus returns to the photo that opened it on close.
    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const opener = document.activeElement as HTMLElement | null;
        dialog.current?.focus();
        document.documentElement.style.overflow = 'hidden';

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                keys.current.onClose();
            } else if (event.key === 'ArrowRight') {
                keys.current.go(1);
            } else if (event.key === 'ArrowLeft') {
                keys.current.go(-1);
            }
        };

        window.addEventListener('keydown', onKeyDown);

        return () => {
            window.removeEventListener('keydown', onKeyDown);
            document.documentElement.style.overflow = '';
            opener?.focus();
        };
    }, [isOpen]);

    // Fetch the neighbours so the next step is instant, and keep the current
    // thumbnail centred in the filmstrip.
    useEffect(() => {
        if (index === null) {
            return;
        }

        for (const step of [1, -1]) {
            const neighbour = images[(index + step + count) % count];

            if (neighbour) {
                new Image().src = neighbour.src;
            }
        }

        filmstrip.current
            ?.querySelector<HTMLElement>(`[data-index="${index}"]`)
            ?.scrollIntoView({
                behavior: reducedMotion ? 'auto' : 'smooth',
                block: 'nearest',
                inline: 'center',
            });
    }, [index, images, count, reducedMotion]);

    const onDragEnd = (_: unknown, info: PanInfo) => {
        if (
            info.offset.x < -SWIPE_DISTANCE ||
            info.velocity.x < -SWIPE_VELOCITY
        ) {
            go(1);
        } else if (
            info.offset.x > SWIPE_DISTANCE ||
            info.velocity.x > SWIPE_VELOCITY
        ) {
            go(-1);
        }
    };

    const current = index === null ? null : images[index];

    return (
        <AnimatePresence>
            {isOpen && current && (
                <motion.div
                    ref={dialog}
                    role="dialog"
                    aria-modal="true"
                    aria-label={`${projectName} gallery`}
                    tabIndex={-1}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: reducedMotion ? 0 : 0.3 }}
                    className="fixed inset-0 z-[80] flex flex-col bg-ink/95 text-cream backdrop-blur-md outline-none"
                >
                    {/* Top bar */}
                    <div className="flex shrink-0 items-center justify-between gap-4 px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-3 md:px-8">
                        <p className="min-w-0 truncate font-sans text-sm text-cream/70">
                            <span className="text-cream">{projectName}</span>
                            <span className="mx-2 text-cream/30">/</span>
                            <span className="tabular-nums">
                                {index + 1} of {count}
                            </span>
                        </p>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close gallery"
                            className="grid size-10 shrink-0 place-items-center rounded-full text-cream/80 transition-colors hover:bg-cream/10 hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
                        >
                            <X className="size-5" strokeWidth={1.5} />
                        </button>
                    </div>

                    {/* Stage — clicking the empty space around the photo closes. */}
                    <div
                        className="relative min-h-0 flex-1 overflow-hidden"
                        onClick={onClose}
                    >
                        <AnimatePresence
                            initial={false}
                            custom={direction}
                            mode="popLayout"
                        >
                            <motion.div
                                key={current.src}
                                custom={direction}
                                variants={{
                                    enter: (step: number) => ({
                                        opacity: 0,
                                        x: reducedMotion ? 0 : step * 80,
                                        scale: reducedMotion ? 1 : 0.98,
                                    }),
                                    center: { opacity: 1, x: 0, scale: 1 },
                                    exit: (step: number) => ({
                                        opacity: 0,
                                        x: reducedMotion ? 0 : step * -80,
                                        scale: reducedMotion ? 1 : 0.98,
                                    }),
                                }}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{
                                    duration: reducedMotion ? 0.15 : 0.45,
                                    ease: EASE,
                                }}
                                drag={count > 1 && !reducedMotion ? 'x' : false}
                                dragConstraints={{ left: 0, right: 0 }}
                                dragElastic={0.25}
                                onDragEnd={onDragEnd}
                                className="absolute inset-0 flex items-center justify-center px-4 py-2 md:px-20"
                            >
                                {!loaded[current.src] && (
                                    <Loader2 className="absolute size-6 animate-spin text-cream/60" />
                                )}
                                <img
                                    src={current.src}
                                    alt={`${projectName}, photo ${index + 1} of ${count}`}
                                    draggable={false}
                                    decoding="async"
                                    onClick={(event) => event.stopPropagation()}
                                    onLoad={() =>
                                        setLoaded((state) => ({
                                            ...state,
                                            [current.src]: true,
                                        }))
                                    }
                                    // A broken photo stops the spinner too.
                                    onError={() =>
                                        setLoaded((state) => ({
                                            ...state,
                                            [current.src]: true,
                                        }))
                                    }
                                    className={cn(
                                        'max-h-full max-w-full rounded-xl object-contain shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)] transition-opacity duration-300 select-none',
                                        !loaded[current.src] && 'opacity-0',
                                    )}
                                />
                            </motion.div>
                        </AnimatePresence>

                        {/* Click either half to step — on a mouse only; touch
                            swipes. The arrow shows only near its edge. */}
                        {count > 1 && (
                            <>
                                <StepZone side="left" onStep={() => go(-1)} />
                                <StepZone side="right" onStep={() => go(1)} />
                            </>
                        )}
                    </div>

                    {/* Filmstrip */}
                    {count > 1 && (
                        <div
                            ref={filmstrip}
                            className="nav-scroll-invert flex shrink-0 justify-start gap-2 overflow-x-auto px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] md:justify-center md:px-8"
                        >
                            {images.map((image, thumbIndex) => (
                                <button
                                    key={image.src}
                                    type="button"
                                    data-index={thumbIndex}
                                    onClick={() => jumpTo(thumbIndex)}
                                    aria-label={`Show photo ${thumbIndex + 1}`}
                                    aria-current={
                                        thumbIndex === index
                                            ? 'true'
                                            : undefined
                                    }
                                    className={cn(
                                        'relative h-12 w-16 shrink-0 overflow-hidden rounded-lg transition-[opacity,outline-color] duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream md:h-14 md:w-20',
                                        thumbIndex === index
                                            ? 'opacity-100 outline-2 outline-offset-2 outline-cream/80'
                                            : 'opacity-40 hover:opacity-80',
                                    )}
                                >
                                    <SmartImage
                                        src={image.thumb}
                                        alt=""
                                        className="size-full"
                                        imgClassName="object-cover"
                                        placeholderClassName="bg-white/10"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}

/**
 * An invisible half of the stage that steps the gallery on click. It is
 * pointer-only (hidden on touch, where swiping takes over), and its arrow
 * fades in only while the mouse is near that edge.
 */
function StepZone({
    side,
    onStep,
}: {
    side: 'left' | 'right';
    onStep: () => void;
}) {
    const Icon = side === 'left' ? ChevronLeft : ChevronRight;

    return (
        <button
            type="button"
            onClick={(event) => {
                event.stopPropagation();
                onStep();
            }}
            aria-label={side === 'left' ? 'Previous photo' : 'Next photo'}
            className={cn(
                'group/zone absolute inset-y-0 hidden w-1/4 items-center px-4 outline-none md:px-6 pointer-fine:flex',
                side === 'left'
                    ? 'left-0 cursor-w-resize justify-start'
                    : 'right-0 cursor-e-resize justify-end',
            )}
        >
            <span className="grid size-11 place-items-center rounded-full text-cream opacity-0 transition-[opacity,background-color] duration-300 group-hover/zone:bg-cream/10 group-hover/zone:opacity-100 group-focus-visible/zone:opacity-100 group-focus-visible/zone:outline-2 group-focus-visible/zone:outline-cream">
                <Icon className="size-6" strokeWidth={1.5} />
            </span>
        </button>
    );
}
