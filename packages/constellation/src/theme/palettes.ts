import type { Tier } from '../types'

/**
 * Default tier palette. Cool, dark-mode-leaning hues — Studio/Terra/Volt
 * theme integration lands in a later iteration once the rendering loop is stable.
 *
 * The corpus tiers (tradition/work/section/quote) climb from cool to warm so
 * tradition reads as "anchors of light" against the finer dust of quotes.
 * Synthesis nodes (wiki concepts and entities) sit on a separate axis — a
 * mint/teal hue — to read as a *cross-cutting* layer of meaning rather than
 * another rung on the corpus hierarchy.
 */
export const DEFAULT_TIER_COLORS: Record<Tier, string> = {
  domain:    '#ffd89c',  // brightest amber — top-of-hierarchy anchors (Wisdom · Literature · Science)
  tradition: '#f4c87b',  // warm amber — sub-anchors (Stoicism, Buddhism, Elizabethan, …)
  work:      '#7aa2ff',  // primary blue — the corpus
  section:   '#9d8df1',  // muted violet — sub-divisions
  quote:     '#a8b3c7',  // pale slate — fine dust
  synthesis: '#79e0c2',  // mint — wiki bridges weaving works together
}

/**
 * Default tier sizes in graph-space units. Cosmos applies `pointSizeScale` on
 * top of these and clamps to `maxPointSize` (hardware-dependent), so the
 * relative ratios matter more than the absolute values.
 */
export const DEFAULT_TIER_SIZES: Record<Tier, number> = {
  domain:    16,    // largest — top of hierarchy
  tradition: 12,
  work:      6,
  section:   2.5,
  quote:     1.5,
  synthesis: 9,    // between tradition and work — cross-cutting anchors
}

/**
 * Parse '#rrggbb' or '#rrggbbaa' into [r, g, b, a] floats in [0, 1].
 * Returns null for invalid input — caller falls back to the tier default.
 */
export function hexToRgba(hex: string): [number, number, number, number] | null {
  const m = hex.replace(/^#/, '')
  if (m.length !== 6 && m.length !== 8) return null
  const r = parseInt(m.slice(0, 2), 16)
  const g = parseInt(m.slice(2, 4), 16)
  const b = parseInt(m.slice(4, 6), 16)
  const a = m.length === 8 ? parseInt(m.slice(6, 8), 16) : 255
  if ([r, g, b, a].some((v) => Number.isNaN(v))) return null
  return [r / 255, g / 255, b / 255, a / 255]
}
