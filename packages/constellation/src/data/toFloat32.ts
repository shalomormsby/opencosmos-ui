import type { ConstellationData, ConstellationNode, EdgeType, Tier } from '../types'
import { DEFAULT_TIER_COLORS, DEFAULT_TIER_SIZES, hexToRgba } from '../theme/palettes'

export interface PreparedGraph {
  /** [x0, y0, x1, y1, ...] — index order matches the input node array */
  positions:  Float32Array
  /** [r0, g0, b0, a0, r1, g1, b1, a1, ...] — point colors */
  colors:     Float32Array
  /** [size0, size1, ...] */
  sizes:      Float32Array
  /** [src0, tgt0, src1, tgt1, ...] — indices into the position array */
  links:      Float32Array
  /** [r0, g0, b0, a0, ...] — link colors keyed by edge index */
  linkColors: Float32Array
  /** [w0, w1, ...] — link widths keyed by edge index */
  linkWidths: Float32Array
  /** Map a point index back to its source node id (for click handlers) */
  indexToId:  string[]
  /** Reverse lookup — used internally to resolve link endpoints */
  idToIndex:  Map<string, number>
}

/**
 * Default per-edge style. Tuned for visibility against a near-black background:
 * structural edges read clearly, wiki bridges stand out as the dominant
 * connective tissue, and the semantic underlayer is visibly present (not
 * decorative-but-invisible) without competing with the curated bridges on top.
 *
 * Earlier values were 2–4× too dim — alpha 0.10 / width 0.3 disappeared
 * entirely against the dark canvas. Bumped across the board.
 *
 * Edge type missing from this table falls back to `hierarchy` styling.
 */
const EDGE_STYLE: Record<EdgeType, { color: [number, number, number, number]; width: number }> = {
  hierarchy:   { color: [0.55, 0.65, 0.85, 0.85], width: 1.5 },  // muted blue
  contains:    { color: [0.62, 0.55, 0.85, 0.70], width: 1.0 },  // muted violet
  cites:       { color: [0.85, 0.78, 0.55, 0.85], width: 1.5 },  // muted amber
  member_of:   { color: [0.70, 0.70, 0.75, 0.70], width: 0.8 },  // gray
  synthesizes: { color: [0.50, 0.92, 0.78, 0.95], width: 2.0 },  // mint — wiki bridges, prominent
  semantic:    { color: [0.95, 0.95, 1.00, 0.70], width: 1.0 },  // soft white — visible underlayer
}

/**
 * Transform a `ConstellationData` payload into the typed-array bundle
 * `@cosmos.gl/graph` expects. Links whose endpoints are not in the node set
 * are silently dropped (with a `console.warn` in dev) — keeps a malformed
 * payload from breaking the renderer.
 *
 * Per-edge color and width are derived from `link.type` so curated bridges
 * (hierarchy / synthesizes / cites) sit visually above the soft semantic
 * underlayer. Override at call site by mutating `EDGE_STYLE` (TODO: expose
 * as a prop if downstream consumers want themed overrides).
 *
 * `pointSizeByDegree > 0` enables a hub/leaf differentiator on top of the
 * tier baseline: nodes with many incoming/outgoing links grow visibly larger
 * than orphans. Formula: `tierSize * (1 + log10(1 + degree) * factor)`.
 */
export function prepareGraph(
  data:              ConstellationData,
  tierColors:        Partial<Record<Tier, string>> = {},
  tierSizes:         Partial<Record<Tier, number>> = {},
  pointSizeByDegree: number = 0,
): PreparedGraph {
  const nodes = data.nodes
  const n = nodes.length

  const positions = new Float32Array(n * 2)
  const colors    = new Float32Array(n * 4)
  const sizes     = new Float32Array(n)
  const indexToId = new Array<string>(n)
  const idToIndex = new Map<string, number>()

  const colorByTier: Record<Tier, [number, number, number, number]> = {
    domain:    hexToRgba(tierColors.domain    ?? DEFAULT_TIER_COLORS.domain)    ?? hexToRgba(DEFAULT_TIER_COLORS.domain)!,
    tradition: hexToRgba(tierColors.tradition ?? DEFAULT_TIER_COLORS.tradition) ?? hexToRgba(DEFAULT_TIER_COLORS.tradition)!,
    work:      hexToRgba(tierColors.work      ?? DEFAULT_TIER_COLORS.work)      ?? hexToRgba(DEFAULT_TIER_COLORS.work)!,
    section:   hexToRgba(tierColors.section   ?? DEFAULT_TIER_COLORS.section)   ?? hexToRgba(DEFAULT_TIER_COLORS.section)!,
    quote:     hexToRgba(tierColors.quote     ?? DEFAULT_TIER_COLORS.quote)     ?? hexToRgba(DEFAULT_TIER_COLORS.quote)!,
    synthesis: hexToRgba(tierColors.synthesis ?? DEFAULT_TIER_COLORS.synthesis) ?? hexToRgba(DEFAULT_TIER_COLORS.synthesis)!,
  }

  const sizeByTier: Record<Tier, number> = {
    domain:    tierSizes.domain    ?? DEFAULT_TIER_SIZES.domain,
    tradition: tierSizes.tradition ?? DEFAULT_TIER_SIZES.tradition,
    work:      tierSizes.work      ?? DEFAULT_TIER_SIZES.work,
    section:   tierSizes.section   ?? DEFAULT_TIER_SIZES.section,
    quote:     tierSizes.quote     ?? DEFAULT_TIER_SIZES.quote,
    synthesis: tierSizes.synthesis ?? DEFAULT_TIER_SIZES.synthesis,
  }

  for (let i = 0; i < n; i++) {
    const node = nodes[i] as ConstellationNode
    positions[i * 2]     = node.x
    positions[i * 2 + 1] = node.y

    const rgba = colorByTier[node.tier]
    colors[i * 4]     = rgba[0]
    colors[i * 4 + 1] = rgba[1]
    colors[i * 4 + 2] = rgba[2]
    colors[i * 4 + 3] = rgba[3]

    const baseSize = sizeByTier[node.tier]
    if (pointSizeByDegree > 0 && node.degree && node.degree > 0) {
      // log10 keeps the curve gentle: degree 9 → +1 step, degree 99 → +2 steps.
      // Multiplying by `pointSizeByDegree` lets the consumer tune amplitude.
      sizes[i] = baseSize * (1 + Math.log10(1 + node.degree) * pointSizeByDegree)
    } else {
      sizes[i] = baseSize
    }

    indexToId[i] = node.id
    idToIndex.set(node.id, i)
  }

  // Build links — drop any whose endpoints aren't in the node set. Compute
  // per-edge color + width arrays in lock-step with the link index so cosmos
  // pairs them up correctly.
  const linkBuf:        number[] = []
  const linkColorsBuf:  number[] = []
  const linkWidthsBuf:  number[] = []
  let dropped = 0
  for (const link of data.links) {
    const s = idToIndex.get(link.source)
    const t = idToIndex.get(link.target)
    if (s === undefined || t === undefined) {
      dropped++
      continue
    }
    linkBuf.push(s, t)
    const style = EDGE_STYLE[link.type] ?? EDGE_STYLE.hierarchy
    linkColorsBuf.push(style.color[0], style.color[1], style.color[2], style.color[3])
    linkWidthsBuf.push(style.width)
  }
  if (dropped > 0 && typeof console !== 'undefined') {
    console.warn(`[constellation] dropped ${dropped} links with missing endpoints`)
  }

  return {
    positions,
    colors,
    sizes,
    links:      new Float32Array(linkBuf),
    linkColors: new Float32Array(linkColorsBuf),
    linkWidths: new Float32Array(linkWidthsBuf),
    indexToId,
    idToIndex,
  }
}
