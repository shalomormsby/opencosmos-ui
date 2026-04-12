'use client'

/**
 * CanvasGraph — canvas-based fallback renderer for KnowledgeGraph
 *
 * Used when WebGL is unavailable (Safari/iOS). Implements the same three-state
 * interaction model as the sigma WebGL path using a three-layer canvas architecture:
 *
 *   Layer 1 — edge canvas:  all edges drawn once at load (offscreen, composited as texture)
 *   Layer 2 — node canvas:  live rAF loop; batched by domain color; pulsed via globalAlpha
 *   Layer 3 — highlight:    degree-1 edges + focus ring; redrawn only on node focus change
 *
 * DPR scaling is established first so hit-testing and rendering share a coordinate space.
 */

import { useEffect, useRef, useCallback, useReducer } from 'react'
import type { KnowledgeGraphData, KnowledgeNode } from './types'
import { DOMAIN_COLORS, CONFIDENCE_OPACITY } from './constants'

// ─── Layout helpers ──────────────────────────────────────────────────────────

interface LayoutNode extends KnowledgeNode {
  radius:    number   // visual radius (px in logical space)
  screenX:   number   // derived from node.x + pan/zoom
  screenY:   number
}

function nodeRadius(n: KnowledgeNode): number {
  return Math.max(3, Math.log(n.connectionCount + 1) * 5) *
    (n.type === 'entity' ? 1.3 : 1)
}

function applyTransform(
  matrix: DOMMatrix,
  nx: number,
  ny: number,
  containerW: number,
  containerH: number,
): { x: number; y: number } {
  // Data coords are in arbitrary layout space; normalise to [-1,1] then to px
  const pt = matrix.transformPoint({ x: nx, y: ny })
  return { x: pt.x, y: pt.y }
}

// ─── Hit testing ─────────────────────────────────────────────────────────────

function hitTest(
  graphPt: { x: number; y: number },
  nodes:   LayoutNode[],
  isCoarse: boolean,
): LayoutNode | null {
  const MIN_HIT_RADIUS = 20
  const candidates = nodes.filter((n) => {
    const r = isCoarse ? Math.max(n.radius, MIN_HIT_RADIUS) : n.radius
    return Math.hypot(graphPt.x - n.x, graphPt.y - n.y) < r
  })
  if (!candidates.length) return null
  return candidates.reduce((best, n) => {
    const d  = Math.hypot(graphPt.x - n.x,    graphPt.y - n.y)
    const db = Math.hypot(graphPt.x - best.x, graphPt.y - best.y)
    return d < db ? n : best
  })
}

// ─── Drawing helpers ─────────────────────────────────────────────────────────

function drawEdgeLayer(canvas: HTMLCanvasElement, data: KnowledgeGraphData, dpr: number) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  const nodeMap = new Map(data.nodes.map((n) => [n.id, n]))
  ctx.strokeStyle = 'rgba(255,255,255,0.07)'
  ctx.lineWidth   = 1

  for (const link of data.links) {
    const s = nodeMap.get(link.source)
    const t = nodeMap.get(link.target)
    if (!s || !t) continue

    ctx.globalAlpha = link.tentative ? 0.25 : 0.08
    if (link.tentative) {
      ctx.setLineDash([4, 4])
    } else {
      ctx.setLineDash([])
    }

    ctx.beginPath()
    ctx.moveTo(s.x, s.y)
    ctx.lineTo(t.x, t.y)
    ctx.stroke()
  }
  ctx.setLineDash([])
  ctx.globalAlpha = 1
}

function drawNodeLayer(
  ctx:   CanvasRenderingContext2D,
  nodes: KnowledgeNode[],
  time:  number,
  dpr:   number,
  panMatrix: DOMMatrix,
) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  // Apply pan/zoom on top of DPR base
  ctx.transform(panMatrix.a, panMatrix.b, panMatrix.c, panMatrix.d, panMatrix.e, panMatrix.f)

  // One globalAlpha pulse per frame — not per node
  ctx.globalAlpha = 0.85 + Math.sin(time * 0.8) * 0.15

  // Batch by domain — one fillStyle per group (~9 groups), not per node
  const byDomain = new Map<string, KnowledgeNode[]>()
  for (const n of nodes) {
    const bucket = byDomain.get(n.domain) ?? []
    bucket.push(n)
    byDomain.set(n.domain, bucket)
  }

  for (const [domain, group] of byDomain) {
    const color = DOMAIN_COLORS[domain] ?? DOMAIN_COLORS.default!
    ctx.fillStyle = color

    ctx.beginPath()
    for (const node of group) {
      const r = nodeRadius(node)
      ctx.moveTo(node.x + r, node.y)
      ctx.arc(node.x, node.y, r, 0, Math.PI * 2)
    }
    ctx.fill()
  }

  ctx.globalAlpha = 1
  ctx.resetTransform()
}

function drawHighlightLayer(
  canvas:      HTMLCanvasElement,
  focused:     KnowledgeNode,
  neighbors:   KnowledgeNode[],
  links:       KnowledgeGraphData['links'],
  dpr:         number,
  panMatrix:   DOMMatrix,
) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.transform(panMatrix.a, panMatrix.b, panMatrix.c, panMatrix.d, panMatrix.e, panMatrix.f)

  // Degree-1 edges at full opacity
  const neighborSet = new Set(neighbors.map((n) => n.id))
  ctx.strokeStyle = 'rgba(255,255,255,0.55)'
  ctx.lineWidth   = 1.5
  ctx.setLineDash([])

  for (const link of links) {
    const isFocusedEdge =
      (link.source === focused.id && neighborSet.has(link.target)) ||
      (link.target === focused.id && neighborSet.has(link.source))
    if (!isFocusedEdge) continue

    // We'll get coordinates from the node list directly (x/y from data)
    // This is a simplified version — full impl would use layout positions
    ctx.beginPath()
    ctx.moveTo(focused.x, focused.y)
    const neighbor = neighbors.find((n) =>
      n.id === (link.source === focused.id ? link.target : link.source),
    )
    if (neighbor) {
      ctx.lineTo(neighbor.x, neighbor.y)
      ctx.stroke()
    }
  }

  // Focus ring on centered node
  const r = nodeRadius(focused) + 6
  const color = DOMAIN_COLORS[focused.domain] ?? DOMAIN_COLORS.default!
  ctx.strokeStyle = color
  ctx.lineWidth   = 2
  ctx.setLineDash([4, 3])
  ctx.beginPath()
  ctx.arc(focused.x, focused.y, r, 0, Math.PI * 2)
  ctx.stroke()
  ctx.setLineDash([])

  ctx.resetTransform()
}

// ─── State ───────────────────────────────────────────────────────────────────

interface CanvasState {
  focusedId: string | null
  panMatrix: DOMMatrix
}

type CanvasAction =
  | { type: 'FOCUS'; id: string | null }
  | { type: 'PAN'; matrix: DOMMatrix }

function canvasReducer(state: CanvasState, action: CanvasAction): CanvasState {
  switch (action.type) {
    case 'FOCUS': return { ...state, focusedId: action.id }
    case 'PAN':   return { ...state, panMatrix: action.matrix }
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

interface CanvasGraphProps {
  data:         KnowledgeGraphData
  onNodeFocus?: (nodeId: string) => void
  reducedMotion: boolean
  className?:   string
}

export function CanvasGraph({ data, onNodeFocus, reducedMotion, className }: CanvasGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const edgeRef      = useRef<HTMLCanvasElement>(null)
  const nodeRef      = useRef<HTMLCanvasElement>(null)
  const hlRef        = useRef<HTMLCanvasElement>(null)

  const [state, dispatch] = useReducer(canvasReducer, {
    focusedId: null,
    panMatrix: new DOMMatrix(),
  })

  const rafRef   = useRef<number>(0)
  const timeRef  = useRef(0)
  const isCoarse = useRef(
    typeof window !== 'undefined'
      ? window.matchMedia('(pointer: coarse)').matches
      : false,
  )

  // Setup canvases with DPR scaling
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const dpr = window.devicePixelRatio || 1
    const w   = container.clientWidth
    const h   = container.clientHeight

    for (const ref of [edgeRef, nodeRef, hlRef]) {
      const canvas = ref.current
      if (!canvas) continue
      canvas.width        = w * dpr
      canvas.height       = h * dpr
      canvas.style.width  = `${w}px`
      canvas.style.height = `${h}px`
    }

    // Draw static edge layer once
    if (edgeRef.current) drawEdgeLayer(edgeRef.current, data, dpr)
  }, [data])

  // Draw highlight layer when focus changes
  useEffect(() => {
    if (!hlRef.current) return
    const dpr  = window.devicePixelRatio || 1

    if (!state.focusedId) {
      const ctx = hlRef.current.getContext('2d')
      ctx?.clearRect(0, 0, hlRef.current.width, hlRef.current.height)
      return
    }

    const focused   = data.nodes.find((n) => n.id === state.focusedId)
    if (!focused) return

    const neighborIds = new Set<string>()
    for (const link of data.links) {
      if (link.source === state.focusedId) neighborIds.add(link.target)
      if (link.target === state.focusedId) neighborIds.add(link.source)
    }
    const neighbors = data.nodes.filter((n) => neighborIds.has(n.id))

    drawHighlightLayer(hlRef.current, focused, neighbors, data.links, dpr, state.panMatrix)
  }, [state.focusedId, state.panMatrix, data])

  // Node animation loop
  useEffect(() => {
    const dpr = window.devicePixelRatio || 1

    function loop(ts: number) {
      const canvas = nodeRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const time = reducedMotion ? 0 : ts / 1000
      drawNodeLayer(ctx, data.nodes, time, dpr, state.panMatrix)
      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [data.nodes, reducedMotion, state.panMatrix])

  // Pointer interaction
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const canvas = nodeRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const lx   = e.clientX - rect.left
      const ly   = e.clientY - rect.top
      const pt   = state.panMatrix.inverse().transformPoint({ x: lx, y: ly })

      const hit  = hitTest(pt, data.nodes as LayoutNode[], isCoarse.current)
      if (hit) {
        dispatch({ type: 'FOCUS', id: hit.id })
        onNodeFocus?.(hit.id)
      } else {
        dispatch({ type: 'FOCUS', id: null })
      }
    },
    [data.nodes, state.panMatrix, onNodeFocus],
  )

  const focusedNode = state.focusedId
    ? data.nodes.find((n) => n.id === state.focusedId)
    : null
  const neighborIds = new Set<string>()
  if (state.focusedId) {
    for (const link of data.links) {
      if (link.source === state.focusedId) neighborIds.add(link.target)
      if (link.target === state.focusedId) neighborIds.add(link.source)
    }
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: 'relative', overflow: 'hidden', background: 'var(--background)' }}
      onPointerDown={handlePointerDown}
    >
      {/* Layer 1: static edge web */}
      <canvas
        ref={edgeRef}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      />
      {/* Layer 2: live node animation */}
      <canvas
        ref={nodeRef}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      />
      {/* Layer 3: focus highlights */}
      <canvas
        ref={hlRef}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      />

      {/* Focus tooltip — same data as sigma path */}
      {focusedNode && (
        <div
          className="absolute bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-80 rounded-lg border border-border bg-background/90 backdrop-blur-sm p-4 shadow-lg"
          style={{ zIndex: 10 }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-widest text-foreground/40">
              {focusedNode.type}
            </span>
            <span className="text-xs text-foreground/40">·</span>
            <span className="text-xs text-foreground/40">{focusedNode.domain}</span>
          </div>
          <p className="font-medium text-foreground mb-1">{focusedNode.title}</p>
          {focusedNode.summary && (
            <p className="text-sm text-foreground/60 leading-relaxed mb-3">
              {focusedNode.summary}
            </p>
          )}
          <a
            href={`/knowledge/wiki/${focusedNode.id}`}
            className="text-sm text-foreground/70 hover:text-foreground underline underline-offset-2 transition-colors"
          >
            Open wiki page →
          </a>
        </div>
      )}

      {/* Accessibility: screen-reader layer */}
      <AccessibilityLayer
        data={data}
        focusedNode={focusedNode ?? null}
        neighborIds={neighborIds}
        onNodeFocus={(id) => {
          dispatch({ type: 'FOCUS', id })
          onNodeFocus?.(id)
        }}
      />
    </div>
  )
}

// ─── Accessibility overlay (shared by canvas + sigma paths) ──────────────────

interface AccessibilityLayerProps {
  data:        KnowledgeGraphData
  focusedNode: KnowledgeNode | null
  neighborIds: Set<string>
  onNodeFocus: (id: string) => void
}

export function AccessibilityLayer({
  data,
  focusedNode,
  neighborIds,
  onNodeFocus,
}: AccessibilityLayerProps) {
  // Domain → nodes
  const byDomain = new Map<string, KnowledgeNode[]>()
  for (const n of data.nodes) {
    const bucket = byDomain.get(n.domain) ?? []
    bucket.push(n)
    byDomain.set(n.domain, bucket)
  }

  return (
    <div className="sr-only">
      {/* Ambient: domain clusters + top hub nodes */}
      <dl>
        {[...byDomain.entries()].map(([domain, nodes]) => {
          const sorted = [...nodes].sort((a, b) => b.connectionCount - a.connectionCount)
          return (
            <div key={domain}>
              <dt>{domain} — {nodes.length} concepts</dt>
              {sorted.slice(0, 5).map((node) => (
                <dd key={node.id}>
                  <button onClick={() => onNodeFocus(node.id)}>
                    {node.title}
                  </button>
                  {' — '}{node.connectionCount} connections. {node.summary}
                </dd>
              ))}
            </div>
          )
        })}
      </dl>

      {/* Focus: traversable neighbor list */}
      <div aria-live="polite" aria-atomic="true">
        {focusedNode && (
          <>
            <p>
              Focused: {focusedNode.title}.{' '}
              {focusedNode.type} in {focusedNode.domain}.
            </p>
            <p>{focusedNode.summary}</p>
            <p>{focusedNode.connectionCount} direct connections:</p>
            <ul>
              {data.nodes
                .filter((n) => neighborIds.has(n.id))
                .map((neighbor) => (
                  <li key={neighbor.id}>
                    <button onClick={() => onNodeFocus(neighbor.id)}>
                      {neighbor.title} — {neighbor.connectionCount} connections
                    </button>
                  </li>
                ))}
            </ul>
            <a href={`/knowledge/wiki/${focusedNode.id}`}>
              Open {focusedNode.title} wiki page
            </a>
          </>
        )}
      </div>
    </div>
  )
}
