import { glyphs } from '@/components/logo'
import { AnimatePresence, motion, type Variants } from 'motion/react'
import { useEffect, useState } from 'react'

const HOLD_MS = 2400

const container: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.18, delayChildren: 0.1 },
  },
}

/**
 * Each glyph draws its outline in, then the fill softly fades up just after the
 * stroke lands — the same signature reveal used by the footer monogram.
 */
const glyph: Variants = {
  hidden: { pathLength: 0, fillOpacity: 0 },
  visible: {
    pathLength: 1,
    fillOpacity: 1,
    transition: {
      pathLength: { duration: 0.9, ease: [0.4, 0, 0.2, 1] },
      fillOpacity: { duration: 0.6, delay: 0.7, ease: 'easeOut' },
    },
  },
}

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/**
 * First-load intro: a white screen with the HFJE wordmark drawing itself as an
 * outline and filling in, then the panel slides up like a curtain to reveal the
 * site. Runs on every full page load (first visit / refresh) but never on
 * Inertia client-side navigation. Skipped under reduced motion.
 */
export default function Preloader() {
  const [visible, setVisible] = useState(() => !prefersReducedMotion())

  useEffect(() => {
    if (!visible) {
      return
    }
    document.body.style.overflow = 'hidden'
    const timer = window.setTimeout(() => setVisible(false), HOLD_MS)
    return () => {
      window.clearTimeout(timer)
      document.body.style.overflow = ''
    }
  }, [visible])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-100 grid place-items-center bg-white"
          initial={{ y: 0 }}
          exit={{ y: '-100%' }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        >
          <motion.svg
            viewBox="0 0 1077.96 314.14"
            role="img"
            aria-label="HFJE"
            className="w-[min(72vw,540px)] fill-ink stroke-ink"
            variants={container}
            initial="hidden"
            animate="visible"
          >
            {glyphs.map((letter) => (
              <motion.path
                key={letter.d}
                d={letter.d}
                strokeWidth={1.5}
                vectorEffect="non-scaling-stroke"
                variants={glyph}
              />
            ))}
          </motion.svg>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
