'use client'

import { useEffect, useRef } from 'react'
import type { Graph } from '@cosmos.gl/graph'
import type { ConstellationNode, Tier } from '../types'
import { tierIsVisibleAtZoom, type LodVisibilityRules } from '../lod/defaults'

interface LabelLayerProps {
  graph:        Graph
  nodes:        ConstellationNode[]
  zoomLevel:    number
  lodRules:     LodVisibilityRules
  /** Minimum clear space between labels; see `DEFAULT_LABEL_MIN_GAP_PX`. */
  labelMinGapPx?: number
}

/** Pixel margin around the viewport for the on-screen culling check. Lets a
 *  label start fading in slightly before its dot crosses the canvas edge. */
const VIEWPORT_MARGIN = 50

/** Maximum number of labels rendered at once. When more nodes pass the LOD +
 *  viewport filter than this, candidates are sorted by `node.degree` (the
 *  edge-degree from the generator's force layout) and the lowest-connectivity
 *  ones are dropped. Naturally biases toward traditions, synthesis nodes, and
 *  highly-cited works — the corpus's most semantically central items. */
const MAX_VISIBLE_LABELS = 100

/**
 * Minimum clear space, in pixels, between two rendered labels. Labels closer
 * than this are treated as colliding and the less important one is dropped.
 * Exported so a consumer can loosen it for a sparse corpus or tighten it for a
 * dense one.
 */
export const DEFAULT_LABEL_MIN_GAP_PX = 4

/**
 * Which label wins when two overlap. Structural anchors outrank the things they
 * contain, so a dense cluster resolves to "Elizabethan" rather than to whichever
 * of thirty play titles happened to sort first.
 */
const TIER_RANK: Record<Tier, number> = {
  domain:    0,
  tradition: 1,
  synthesis: 2,
  work:      3,
  section:   4,
  quote:     5,
}

/** Rough on-screen font metrics per tier, mirroring `applyTierStyle`. */
const TIER_FONT_PX: Record<Tier, number> = {
  domain: 15, tradition: 13, synthesis: 12, work: 11, section: 10, quote: 9,
}

/** Cell size of the collision grid, in pixels. Comfortably larger than a short
 *  label so most boxes touch only one or two cells. */
const GRID_PX = 64

/**
 * HTML overlay that renders text labels for currently-visible nodes whose
 * tier passes the LOD rule.
 *
 * Strategy: **deterministic, pull-based**. Every frame the rAF loop reads the
 * full position array via `graph.getPointPositions()` and walks each tier
 * passing LOD, projecting nodes through `spaceToScreenPosition` and culling
 * to the viewport. No `trackPointPositionsByIndices` and no sampling.
 *
 * Why pull instead of track? Cosmos's tracked-position map updates on its
 * internal tick after `trackPointPositionsByIndices` is called, which leaves
 * a one-frame gap when the tier set changes (zoom crosses an LOD threshold).
 * Worse, the ambient drift loop's `setPointPositions` can transiently clear
 * the tracked cache. `getPointPositions()` returns the current array directly
 * — no state or lag.
 *
 * Performance: 700 nodes × ~5 µs per `spaceToScreenPosition` ≈ 3.5 ms / frame
 * worst case. Well within budget at 60 Hz.
 *
 * The wrapper has `pointer-events: none`; clicks pass through to the canvas.
 */
export function LabelLayer({
  graph,
  nodes,
  zoomLevel,
  lodRules,
  labelMinGapPx = DEFAULT_LABEL_MIN_GAP_PX,
}: LabelLayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  const zoomLevelRef = useRef(zoomLevel)
  zoomLevelRef.current = zoomLevel
  const lodRulesRef = useRef(lodRules)
  lodRulesRef.current = lodRules
  const minGapRef = useRef(labelMinGapPx)
  minGapRef.current = labelMinGapPx

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Pre-bucket node indices by tier so the rAF tick can iterate quickly
    // without re-walking the whole nodes array.
    const indicesByTier = new Map<Tier, number[]>()
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i]
      if (!n) continue
      const list = indicesByTier.get(n.tier) ?? []
      list.push(i)
      indicesByTier.set(n.tier, list)
    }

    // id → label element; mounted on enter, removed on exit.
    const labelEls = new Map<string, HTMLDivElement>()

    let frameId: number | null = null

    // Reusable candidate buffer — populated each frame, sorted by degree to
    // apply the density cap. Reused across ticks to avoid per-frame allocation.
    const candidates: Array<{ node: ConstellationNode; screenX: number; screenY: number; degree: number }> = []
    /** Survivors of the collision pass, in importance order. */
    const accepted: typeof candidates = []
    /** Uniform grid of accepted label boxes, keyed by (col, row). */
    const occupied = new Map<number, Array<{ cx: number; cy: number; halfW: number; halfH: number }>>()

    const tick = () => {
      const currentZoom = zoomLevelRef.current
      const currentLod  = lodRulesRef.current

      // Pull the current full position array. Cosmos's internal layout / drift
      // mutations are reflected here on the next frame after they fire.
      const positions = graph.getPointPositions()
      const w = container.clientWidth
      const h = container.clientHeight

      // Phase 1: collect every candidate that passes LOD + viewport culling.
      candidates.length = 0
      for (const [tier, indices] of indicesByTier) {
        if (!tierIsVisibleAtZoom(tier, currentZoom, currentLod)) continue

        for (const idx of indices) {
          const node = nodes[idx]
          if (!node) continue

          const dx = positions[idx * 2]
          const dy = positions[idx * 2 + 1]
          if (dx === undefined || dy === undefined) continue

          const [screenX, screenY] = graph.spaceToScreenPosition([dx, dy])

          if (
            screenX < -VIEWPORT_MARGIN ||
            screenY < -VIEWPORT_MARGIN ||
            screenX > w + VIEWPORT_MARGIN ||
            screenY > h + VIEWPORT_MARGIN
          ) continue

          candidates.push({ node, screenX, screenY, degree: node.degree ?? 0 })
        }
      }

      // Phase 2: rank by structural importance, then connectivity. Everything
      // downstream (collision, density cap) consumes this order, so the most
      // meaningful labels are the ones that survive.
      candidates.sort((a, b) => {
        const rank = TIER_RANK[a.node.tier] - TIER_RANK[b.node.tier]
        return rank !== 0 ? rank : b.degree - a.degree
      })

      // Phase 2.5: drop labels that would overlap one already accepted. Without
      // this, a dense cluster (all of Shakespeare, say) renders as an unreadable
      // pile of superimposed titles. Greedy in importance order, with a uniform
      // grid so the check stays linear rather than quadratic.
      accepted.length = 0
      occupied.clear()
      const LABEL_MIN_GAP_PX = minGapRef.current
      for (const c of candidates) {
        if (accepted.length >= MAX_VISIBLE_LABELS) break

        const font = TIER_FONT_PX[c.node.tier]
        // Estimated box: ~0.55em average glyph advance, anchored per the
        // transform below (centered horizontally, sitting 8px above the point).
        const halfW = Math.min(c.node.label.length * font * 0.55, 180) / 2 + LABEL_MIN_GAP_PX
        const halfH = (font + 4) / 2 + LABEL_MIN_GAP_PX
        const cx = c.screenX
        const cy = c.screenY - 8 - halfH

        const col0 = Math.floor((cx - halfW) / GRID_PX)
        const col1 = Math.floor((cx + halfW) / GRID_PX)
        const row0 = Math.floor((cy - halfH) / GRID_PX)
        const row1 = Math.floor((cy + halfH) / GRID_PX)

        let collides = false
        for (let col = col0; col <= col1 && !collides; col++) {
          for (let row = row0; row <= row1 && !collides; row++) {
            const bucket = occupied.get(col * 100003 + row)
            if (!bucket) continue
            for (const b of bucket) {
              if (
                Math.abs(cx - b.cx) < halfW + b.halfW &&
                Math.abs(cy - b.cy) < halfH + b.halfH
              ) { collides = true; break }
            }
          }
        }
        if (collides) continue

        const box = { cx, cy, halfW, halfH }
        for (let col = col0; col <= col1; col++) {
          for (let row = row0; row <= row1; row++) {
            const key = col * 100003 + row
            const bucket = occupied.get(key)
            if (bucket) bucket.push(box)
            else occupied.set(key, [box])
          }
        }
        accepted.push(c)
      }

      // Phase 3: paint surviving candidates; track which ids are wanted this frame.
      const wantedIds = new Set<string>()
      for (const c of accepted) {
        wantedIds.add(c.node.id)

        let el = labelEls.get(c.node.id)
        if (!el) {
          el = document.createElement('div')
          el.textContent = c.node.label
          applyBaseStyle(el)
          applyTierStyle(el, c.node.tier)
          container.appendChild(el)
          labelEls.set(c.node.id, el)
        }

        // Center horizontally on the point, anchor 8 px above it.
        el.style.transform = `translate(${c.screenX}px, ${c.screenY}px) translate(-50%, calc(-100% - 8px))`
      }

      // Phase 4: tear down labels that fell out of LOD / viewport / density cap.
      for (const [id, el] of labelEls) {
        if (!wantedIds.has(id)) {
          if (el.parentNode === container) container.removeChild(el)
          labelEls.delete(id)
        }
      }

      frameId = requestAnimationFrame(tick)
    }

    frameId = requestAnimationFrame(tick)

    return () => {
      if (frameId !== null) cancelAnimationFrame(frameId)
      for (const el of labelEls.values()) {
        if (el.parentNode === container) container.removeChild(el)
      }
      labelEls.clear()
    }
  }, [graph, nodes])

  return (
    <div
      ref={containerRef}
      style={{
        position:      'absolute',
        inset:         0,
        pointerEvents: 'none',
        overflow:      'hidden',
      }}
    />
  )
}

// ─── Style helpers (imperative, applied once per label element) ───────────────

function applyBaseStyle(el: HTMLDivElement) {
  el.style.position   = 'absolute'
  el.style.left       = '0'
  el.style.top        = '0'
  el.style.whiteSpace = 'nowrap'
}

function applyTierStyle(el: HTMLDivElement, tier: Tier) {
  switch (tier) {
    case 'domain':
      // Top-of-hierarchy anchors: Wisdom, Literature, Science. Most prominent
      // label tier — larger, brighter, more letter-spacing.
      el.style.fontSize       = '15px'
      el.style.fontWeight     = '700'
      el.style.color          = 'rgba(255,255,255,1.0)'
      el.style.textShadow     = '0 1px 3px rgba(0,0,0,0.9)'
      el.style.letterSpacing  = '0.04em'
      el.style.textTransform  = 'uppercase'
      return
    case 'tradition':
      el.style.fontSize       = '13px'
      el.style.fontWeight     = '600'
      el.style.color          = 'rgba(255,255,255,0.95)'
      el.style.textShadow     = '0 1px 2px rgba(0,0,0,0.8)'
      el.style.letterSpacing  = '0.02em'
      return
    case 'work':
      el.style.fontSize   = '11px'
      el.style.fontWeight = '500'
      el.style.color      = 'rgba(255,255,255,0.85)'
      el.style.textShadow = '0 1px 2px rgba(0,0,0,0.7)'
      return
    case 'section':
      el.style.fontSize   = '10px'
      el.style.fontWeight = '400'
      el.style.color      = 'rgba(255,255,255,0.7)'
      el.style.textShadow = '0 1px 2px rgba(0,0,0,0.6)'
      return
    case 'quote':
      el.style.fontSize     = '9px'
      el.style.fontStyle    = 'italic'
      el.style.color        = 'rgba(255,255,255,0.6)'
      el.style.textShadow   = '0 1px 2px rgba(0,0,0,0.6)'
      el.style.maxWidth     = '180px'
      el.style.textOverflow = 'ellipsis'
      el.style.overflow     = 'hidden'
      return
    case 'synthesis':
      el.style.fontSize       = '12px'
      el.style.fontWeight     = '500'
      el.style.color          = '#79e0c2'
      el.style.textShadow     = '0 1px 2px rgba(0,0,0,0.8)'
      el.style.letterSpacing  = '0.01em'
      return
  }
}
