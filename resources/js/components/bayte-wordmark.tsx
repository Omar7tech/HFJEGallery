/**
 * The BAYTÉ wordmark rendered as a mask, so it takes its color from a `bg-*`
 * utility instead of the two fixed fills inside the SVG file. Decorative —
 * pair it with a visible or screen-reader label where the name matters.
 */
export default function BayteWordmark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`block aspect-[1920/518] bg-brand mask-[url(/logos/bayte.svg)] mask-contain mask-center mask-no-repeat ${className ?? ''}`}
    />
  )
}
