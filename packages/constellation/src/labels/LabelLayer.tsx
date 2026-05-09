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
export function LabelLayer({ graph, nodes, zoomLevel, lodRules }: LabelLayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  const zoomLevelRef = useRef(zoomLevel)
  zoomLevelRef.current = zoomLevel
  const lodRulesRef = useRef(lodRules)
  lodRulesRef.current = lodRules

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

      // Phase 2: apply the density cap. When too many candidates pass the
      // viewport filter, keep the highest-degree ones — these are the corpus's
      // most-connected nodes (traditions, popular works, key wiki bridges).
      if (candidates.length > MAX_VISIBLE_LABELS) {
        candidates.sort((a, b) => b.degree - a.degree)
        candidates.length = MAX_VISIBLE_LABELS
      }

      // Phase 3: paint surviving candidates; track which ids are wanted this frame.
      const wantedIds = new Set<string>()
      for (const c of candidates) {
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
