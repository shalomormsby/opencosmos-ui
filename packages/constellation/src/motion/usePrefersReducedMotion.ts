'use client'

import { useEffect, useState } from 'react'

/**
 * Subscribe to the `prefers-reduced-motion` media query. Returns `true` when
 * the user has asked the system to minimize non-essential motion.
 *
 * SSR-safe: returns `false` during server render and on first client paint,
 * then updates after `matchMedia` resolves on mount.
 */
export function usePrefersReducedMotion(): boolean {
  const [prefers, setPrefers] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefers(mq.matches)
    const listener = (e: MediaQueryListEvent) => setPrefers(e.matches)
    mq.addEventListener('change', listener)
    return () => mq.removeEventListener('change', listener)
  }, [])

  return prefers
}
