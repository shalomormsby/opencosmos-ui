import type { Tier } from '../types'

/**
 * Per-tier minimum zoom level at which the tier's labels become visible.
 *
 * `LOD = visual weight, not visibility` — every node stays on the canvas at
 * every zoom level. This rule set governs **labels only**: at low zoom we
 * read the constellation as cluster centers (traditions); as we zoom in,
 * works, then sections, then quotes resolve into named text.
 *
 * `undefined` for a tier means its labels never render. (The dots still do.)
 */
export type LodVisibilityRules = Partial<Record<Tier, number>>

/**
 * Sensible defaults tuned to a typical landing-page zoom range. Cosmos's
 * default zoom level is ~1; users typically zoom up to ~10 by interacting.
 *
 * - Traditions are always labeled (anchors of the corpus).
 * - Works appear past zoom 1.5 (most of the corpus's structural identity).
 * - Sections appear past zoom 3 (sub-divisions inside a work).
 * - Quotes appear past zoom 6 (the finest grain — only when truly close).
 */
export const DEFAULT_LOD_VISIBILITY: LodVisibilityRules = {
  // Progressive reveal — each tier earns its airspace by zoom level. At < 1.0
  // only the three domain anchors are visible; subsequent tiers fade in as
  // the user zooms past each threshold.
  domain:    0,     // < 1.0 ⇒ Wisdom · Literature · Science only
  tradition: 1.0,   // 1.0 ⇒ + 23 traditions (incl. Philosophy umbrella)
  synthesis: 1.31,  // 1.31 ⇒ + 30 wiki-bridge concepts/entities
  work:      2.0,   // 2.0 ⇒ + 84 works
  section:   4.5,   // 4.5 ⇒ + 514 sections (dense — push past works)
  quote:     6.0,   // 6.0 ⇒ + 46 quotes (only when truly close)
}

export function tierIsVisibleAtZoom(
  tier:  Tier,
  zoom:  number,
  rules: LodVisibilityRules,
): boolean {
  const minZoom = rules[tier]
  if (minZoom === undefined) return false
  return zoom >= minZoom
}
