/**
 * Public types for the constellation knowledge graph.
 *
 * These mirror the payload shape served by OpenCosmos at
 * `/api/knowledge/constellation` and emitted by the generator at
 * `scripts/knowledge/generate-constellation-graph.ts` in the consumer repo.
 */

export type Tier = 'domain' | 'tradition' | 'work' | 'section' | 'quote' | 'synthesis'

export type EdgeType =
  | 'hierarchy'   // tradition → work
  | 'contains'    // work → section
  | 'cites'       // quote → work | section
  | 'member_of'   // quote → tradition (fallback when source_work is null)
  | 'synthesizes' // synthesis (wiki concept/entity) → work it weaves together
  | 'semantic'    // work ↔ work — top-K cosine-similarity neighbor (soft underlayer)

export interface ConstellationNode {
  /** Stable, citation-friendly id, e.g. `sources/buddhism-the-dhammapada` */
  id:        string
  /** Hierarchical tier — drives default color and size */
  tier:      Tier
  /** Human-readable label shown in tooltips and label overlays */
  label:     string
  /** Pre-computed x position from the generator's force-directed layout */
  x:         number
  /** Pre-computed y position */
  y:         number
  /** Optional fields preserved for downstream consumers (filtering, palettes, citations) */
  domain?:           string
  tradition?:        string
  author?:           string
  parent?:           string
  category?:         string
  provenanceStatus?: string
  /** Edge-degree count from the layout pass; useful as a size modifier */
  degree?: number
}

export interface ConstellationLink {
  source: string
  target: string
  type:   EdgeType
}

export interface ConstellationData {
  nodes:       ConstellationNode[]
  links:       ConstellationLink[]
  generatedAt: number
}

/**
 * Imperative handle returned from `onReady`. Consumers should treat this as
 * an opaque API surface: fields may be added but the existing methods are
 * stable across minor versions.
 */
export interface KnowledgeGraphApi {
  /** Animate the camera back to a fit-the-whole-corpus view. */
  fitView:        (durationMs?: number, padding?: number) => void
  /** Map a node id to its internal point index (or `null` if unknown). */
  getNodeIndex:   (nodeId: string) => number | null
}

export interface KnowledgeGraphProps {
  data: ConstellationData
  /** Fires with the clicked node's id (not its index) */
  onNodeClick?: (nodeId: string) => void
  /**
   * Fires with the hovered node's id (or `null` when the cursor leaves the
   * canvas / moves off all nodes). Throttled by cosmos.gl's internal hit-test
   * to ~60 Hz max. Use for tooltip overlays, hover-state highlights, etc.
   */
  onNodeHover?: (nodeId: string | null) => void
  /** Override default tier-based colors (RGB hex, e.g. '#7aa2ff') */
  tierColors?: Partial<Record<Tier, string>>
  /** Override default tier-based point sizes (in graph-space units) */
  tierSizes?: Partial<Record<Tier, number>>
  /**
   * Multiply per-node size by a degree-based factor:
   *   sizeScale = 1 + log10(1 + degree) * <factor>
   * `0` (default) disables — every node uses its tier size verbatim.
   * `0.3` is a gentle differentiator: a degree-50 hub grows ~1.5×; orphans stay at 1×.
   */
  pointSizeByDegree?: number
  /** Background color for the canvas. Default: 'transparent' */
  backgroundColor?: string
  /** className applied to the host div — control width/height from the consumer */
  className?: string
  /**
   * Render text labels over visible nodes. Default: `true`.
   * Labels are sampled (cosmos.gl uses `pointSamplingDistance: 100px` screen
   * space) and tier-filtered by `lodVisibility`.
   */
  showLabels?: boolean
  /**
   * Per-tier minimum zoom at which labels become visible.
   * Defaults to `DEFAULT_LOD_VISIBILITY` from this package.
   */
  lodVisibility?: Partial<Record<Tier, number>>
  /**
   * Fires whenever the zoom level changes (pan and zoom both emit). Use this
   * to drive UI that depends on the current zoom (legends, mini-maps, etc.).
   *
   * Note: emits at d3-zoom rate (up to ~60 Hz during continuous interaction).
   * Throttle in the consumer if a downstream re-render is expensive.
   */
  onZoomChange?: (zoom: number) => void
  /**
   * Apply a low-amplitude sine perturbation to point positions while mounted —
   * the graph "breathes" rather than sitting frozen. Default `true`.
   * Auto-disables when the user prefers reduced motion.
   *
   * Pass `false` to disable. Pass an options object to tune motion:
   *   `{ amplitude: 0.002, speed: 0.2 }` — slower / quieter for explore pages
   *   `{ amplitude: 0.005, speed: 0.4 }` — current default for hero ambient
   */
  ambientDrift?: boolean | { amplitude?: number; speed?: number }
  /**
   * Node id to center the camera on. Pass `null`/`undefined` to revert to the
   * full-corpus view. Changes trigger a tweened camera transition.
   *
   * Also drives the focus ring overlay (`focusedPointIndex` in cosmos.gl) so
   * the selected node visibly stands apart from the rest of the field.
   */
  focus?: string | null
  /**
   * Hop radius around `focus`:
   *   0 → just the target,
   *   1 → target + immediate neighbors (default),
   *   N → target + neighbors out to N hops (BFS over edges).
   */
  focusRadius?: number
  /** Camera tween duration in ms when `focus` changes. Default 800. */
  focusDuration?: number
  /**
   * Color of the soft ring rendered around the focused node. CSS color string
   * or RGBA tuple. Default: warm white at 65% alpha.
   */
  focusedPointRingColor?: string | [number, number, number, number]
  /**
   * Color of the soft ring rendered around the hovered node. Default: same
   * warm white at lower alpha. Set to `'transparent'` to disable hover rings.
   */
  hoveredPointRingColor?: string | [number, number, number, number]
  /**
   * Fired once the graph instance is mounted and the initial fitView has
   * settled. Consumers receive an imperative API for actions that don't
   * map cleanly onto props (e.g. "reset view" button, programmatic refit).
   */
  onReady?: (api: KnowledgeGraphApi) => void
}
