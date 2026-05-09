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

export interface KnowledgeGraphProps {
  data: ConstellationData
  /** Fires with the clicked node's id (not its index) */
  onNodeClick?: (nodeId: string) => void
  /** Override default tier-based colors (RGB hex, e.g. '#7aa2ff') */
  tierColors?: Partial<Record<Tier, string>>
  /** Override default tier-based point sizes (in graph-space units) */
  tierSizes?: Partial<Record<Tier, number>>
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
   */
  ambientDrift?: boolean
  /**
   * Node id to center the camera on. Pass `null`/`undefined` to revert to the
   * full-corpus view. Changes trigger a tweened camera transition.
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
}
