import { Loader2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SmartImageProps {
  src: string
  alt: string
  /** Classes for the wrapper box (sizing, aspect, radius, overflow). */
  className?: string
  /** Classes for the `<img>` itself (object-fit, transforms). */
  imgClassName?: string
  /** Classes for the loading placeholder — match the surface behind the image. */
  placeholderClassName?: string
  loading?: 'lazy' | 'eager'
  fetchPriority?: 'high' | 'low' | 'auto'
  /** Overlays rendered above the image, e.g. gradients or badges. */
  children?: ReactNode
}

/**
 * An image that shows a terracotta spinner over a cream placeholder while it
 * loads, then fades in. The wrapper takes the layout/size classes; the image
 * fills it.
 */
export function SmartImage({
  src,
  alt,
  className,
  imgClassName,
  placeholderClassName = 'bg-cream',
  loading = 'lazy',
  fetchPriority,
  children,
}: SmartImageProps) {
  const ref = useRef<HTMLImageElement>(null)
  const [loaded, setLoaded] = useState(false)

  // Reset on src change, but treat already-cached images as loaded so the
  // spinner doesn't flash (a cached image won't fire `onLoad`).
  useEffect(() => {
    setLoaded(ref.current?.complete ?? false)
  }, [src])

  return (
    <span className={cn('relative block overflow-hidden', className)}>
      {!loaded && (
        <span
          className={cn(
            'absolute inset-0 grid place-items-center',
            placeholderClassName,
          )}
        >
          <Loader2 className="size-6 animate-spin text-brand/60" />
        </span>
      )}

      <img
        ref={ref}
        src={src}
        alt={alt}
        loading={loading}
        decoding="async"
        draggable={false}
        fetchPriority={fetchPriority}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className={cn(
          'size-full transition-opacity duration-500 ease-out',
          !loaded && 'opacity-0',
          imgClassName,
        )}
      />

      {children}
    </span>
  )
}
