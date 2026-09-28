import { SmartImage } from '@/components/smart-image';
import type { CurtainStyle } from '@/types';

interface CurtainStyleCardProps {
    style: CurtainStyle;
    /** Above the fold: fetch the photo with the page instead of lazily. */
    eager?: boolean;
}

/**
 * A curtain style as a plain card: its photo, then the name and the one-line
 * description underneath.
 */
export default function CurtainStyleCard({
    style,
    eager = false,
}: CurtainStyleCardProps) {
    return (
        <article>
            <SmartImage
                src={style.image}
                alt={style.name}
                loading={eager ? 'eager' : 'lazy'}
                fetchPriority={eager ? 'high' : undefined}
                className="aspect-3/4 rounded-2xl @3xl:rounded-3xl"
                imgClassName="object-cover"
            />
            <h3 className="mt-4 font-display text-[clamp(0.95rem,2cqi,1.2rem)] leading-snug text-brand max-md:mt-2.5">
                {style.name}
            </h3>
            <p className="mt-1.5 font-sans text-base leading-relaxed text-ink/70 max-md:mt-1 max-md:text-sm max-md:leading-snug">
                {style.description}
            </p>
        </article>
    );
}
