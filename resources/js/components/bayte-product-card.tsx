import { Plus } from 'lucide-react';
import {
    motion,
    useMotionTemplate,
    useMotionValue,
    useReducedMotion,
    useSpring,
    useTransform,
} from 'motion/react';
import type { PointerEvent } from 'react';
import BayteWordmark from '@/components/bayte-wordmark';
import { SmartImage } from '@/components/smart-image';
import { cn } from '@/lib/utils';

interface BayteProductCardProps {
    name: string;
    description: string;
    /** Product cutout — transparent background works best on the card. */
    src: string;
    alt: string;
    /** Fired by the "+" button; omit it to render the badge as decoration. */
    onSelect?: () => void;
    /** Extra classes for the card itself (grid placement, width…). */
    className?: string;
}

/** How far the card leans, in degrees, at the far edge of the pointer travel. */
const TILT = 9;
/** Loose enough to feel like weight, tight enough to never lag the cursor. */
const SPRING = {
    type: 'spring',
    stiffness: 170,
    damping: 20,
    mass: 0.6,
} as const;

/**
 * A BAYTÉ catalogue card: name and description top-left, a terracotta "+"
 * top-right, the product cutout in the middle and the wordmark at the foot.
 *
 * On a mouse it becomes a shallow 3D object — the card leans toward the
 * pointer while the product, badge and text sit on their own planes above it,
 * so they part in real parallax rather than sliding as one picture. A specular
 * sheen tracks the cursor, and the contact shadow under the product swings
 * opposite the lean so the cutout reads as floating off the card. Touch and
 * reduced-motion visitors get the flat card.
 */
export default function BayteProductCard({
    name,
    description,
    src,
    alt,
    onSelect,
    className,
}: BayteProductCardProps) {
    const reducedMotion = useReducedMotion();

    // Pointer position over the card, 0→1 on each axis; both rest at centre.
    const pointerX = useMotionValue(0.5);
    const pointerY = useMotionValue(0.5);
    const smoothX = useSpring(pointerX, SPRING);
    const smoothY = useSpring(pointerY, SPRING);

    const rotateY = useTransform(smoothX, [0, 1], [-TILT, TILT]);
    const rotateX = useTransform(smoothY, [0, 1], [TILT, -TILT]);

    // The cutout drifts with the lean — the parallax that sells the depth.
    const productX = useTransform(smoothX, [0, 1], [-16, 16]);
    const productY = useTransform(smoothY, [0, 1], [-12, 12]);

    // The shadow it casts slides the other way, and squashes as the card tips.
    const contactX = useTransform(smoothX, [0, 1], [14, -14]);
    const contactScale = useTransform(smoothY, [0, 1], [0.88, 1.12]);

    const sheenX = useTransform(smoothX, (value) => `${value * 100}%`);
    const sheenY = useTransform(smoothY, (value) => `${value * 100}%`);
    const sheen = useMotionTemplate`radial-gradient(420px circle at ${sheenX} ${sheenY}, rgba(255,255,255,0.85), rgba(255,255,255,0) 62%)`;

    const shadowX = useTransform(smoothX, [0, 1], [24, -24]);
    const shadowY = useTransform(smoothY, [0, 1], [28, 6]);
    const shadow = useMotionTemplate`${shadowX}px ${shadowY}px 54px -30px rgba(74, 48, 32, 0.55)`;

    const trackPointer = (event: PointerEvent<HTMLElement>) => {
        if (reducedMotion || event.pointerType !== 'mouse') {
            return;
        }

        const bounds = event.currentTarget.getBoundingClientRect();

        pointerX.set((event.clientX - bounds.left) / bounds.width);
        pointerY.set((event.clientY - bounds.top) / bounds.height);
    };

    const releasePointer = () => {
        pointerX.set(0.5);
        pointerY.set(0.5);
    };

    const badgeClassName =
        'grid size-7 shrink-0 place-items-center rounded-full bg-brand text-brand-foreground';

    return (
        <motion.article
            onPointerMove={trackPointer}
            onPointerLeave={releasePointer}
            style={
                reducedMotion
                    ? undefined
                    : {
                          rotateX,
                          rotateY,
                          boxShadow: shadow,
                          transformPerspective: 1100,
                      }
            }
            whileHover={reducedMotion ? undefined : { scale: 1.025 }}
            transition={SPRING}
            className={cn(
                'group relative z-0 flex flex-col rounded-2xl bg-[#f2f1ef] p-5 will-change-transform [perspective:1100px] transform-3d hover:z-10',
                'transition-colors duration-500 ease-out hover:bg-[#f5f4f1] motion-reduce:transition-none',
                className,
            )}
        >
            {/* Specular sheen — only lit while the pointer is on the card. */}
            <motion.span
                aria-hidden="true"
                style={reducedMotion ? undefined : { backgroundImage: sheen }}
                className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 mix-blend-soft-light transition-opacity duration-500 ease-out group-hover:opacity-100 motion-reduce:hidden"
            />

            {/* A hairline of light along the top edge as the card lifts. */}
            <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-90 motion-reduce:hidden"
            />

            <div className="flex items-start justify-between gap-4 transition-transform duration-500 ease-out group-hover:translate-z-[26px] motion-reduce:transition-none motion-reduce:group-hover:translate-z-0">
                <div className="min-w-0">
                    <h3 className="text-xl leading-none text-ink">{name}</h3>
                    <p className="mt-2 text-xs leading-none text-ink/70">
                        {description}
                    </p>
                </div>

                {onSelect ? (
                    <button
                        type="button"
                        onClick={onSelect}
                        aria-label={`View ${name}`}
                        className={cn(
                            badgeClassName,
                            'transition-[background-color,transform,translate,rotate] duration-500 ease-out group-hover:translate-z-[48px] group-hover:rotate-90 hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand motion-reduce:transition-none motion-reduce:group-hover:rotate-0',
                        )}
                    >
                        <Plus className="size-4" strokeWidth={2.5} />
                    </button>
                ) : (
                    <span
                        aria-hidden="true"
                        className={cn(
                            badgeClassName,
                            'transition-transform duration-500 ease-out group-hover:translate-z-[48px] group-hover:rotate-90 motion-reduce:transition-none motion-reduce:group-hover:rotate-0',
                        )}
                    >
                        <Plus className="size-4" strokeWidth={2.5} />
                    </span>
                )}
            </div>

            <div className="relative mt-4 aspect-3/2 w-full transform-3d">
                {/* Ground shadow, kept on a lower plane than the cutout. */}
                <motion.span
                    aria-hidden="true"
                    style={
                        reducedMotion
                            ? undefined
                            : { x: contactX, scaleX: contactScale }
                    }
                    className="pointer-events-none absolute inset-x-8 bottom-1 h-5 rounded-[50%] bg-ink/25 opacity-0 blur-lg transition-[opacity,transform,translate] duration-500 ease-out group-hover:translate-z-[18px] group-hover:opacity-100 motion-reduce:hidden"
                />

                <motion.div
                    style={
                        reducedMotion ? undefined : { x: productX, y: productY }
                    }
                    className="absolute inset-0 transition-transform duration-500 ease-out group-hover:translate-z-[72px] group-hover:scale-[1.06] motion-reduce:transition-none motion-reduce:group-hover:translate-z-0 motion-reduce:group-hover:scale-100"
                >
                    <SmartImage
                        src={src}
                        alt={alt}
                        className="size-full"
                        imgClassName="object-contain"
                        placeholderClassName="bg-transparent"
                    />
                </motion.div>
            </div>

            <BayteWordmark className="mx-auto mt-4 w-24 transition-transform duration-500 ease-out group-hover:translate-z-[34px] motion-reduce:transition-none motion-reduce:group-hover:translate-z-0" />
        </motion.article>
    );
}
