import { Plus } from 'lucide-react'
import BayteWordmark from '@/components/bayte-wordmark'
import { SmartImage } from '@/components/smart-image'
import { cn } from '@/lib/utils'

interface BayteProductCardProps {
  name: string
  description: string
  /** Product cutout — transparent background works best on the card. */
  src: string
  alt: string
  /** Fired by the "+" button; omit it to render the badge as decoration. */
  onSelect?: () => void
  /** Extra classes for the card itself (grid placement, width…). */
  className?: string
}

/**
 * A BAYTÉ catalogue card: name and description top-left, a terracotta "+"
 * top-right, the product cutout in the middle and the wordmark at the foot.
 */
export default function BayteProductCard({
  name,
  description,
  src,
  alt,
  onSelect,
  className,
}: BayteProductCardProps) {
  const badgeClassName =
    'grid size-7 shrink-0 place-items-center rounded-full bg-brand text-brand-foreground'

  return (
    <article className={cn('flex flex-col rounded-2xl bg-[#f2f1ef] p-5', className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="leading-none text-ink text-xl">{name}</h3>
          <p className="mt-2 leading-none text-ink/70 text-xs">{description}</p>
        </div>

        {onSelect ? (
          <button
            type="button"
            onClick={onSelect}
            aria-label={`View ${name}`}
            className={cn(
              badgeClassName,
              'transition-colors duration-300 ease-out hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand motion-reduce:transition-none',
            )}
          >
            <Plus className="size-4" strokeWidth={2.5} />
          </button>
        ) : (
          <span aria-hidden="true" className={badgeClassName}>
            <Plus className="size-4" strokeWidth={2.5} />
          </span>
        )}
      </div>

      <SmartImage
        src={src}
        alt={alt}
        className="mt-4 aspect-3/2 w-full"
        imgClassName="object-contain"
      />

      <BayteWordmark className="mx-auto mt-4 w-24" />
    </article>
  )
}
