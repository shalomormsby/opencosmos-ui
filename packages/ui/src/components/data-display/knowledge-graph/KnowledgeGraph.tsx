'use client'

/**
 * KnowledgeGraph — sigma v3 WebGL knowledge graph with canvas fallback
 *
 * Three-state interaction model:
 *   Ambient → Focus (click / search result) → Search (⌘K or search button)
 *
 * Renderer selection:
 *   - Detects WebGL on mount; routes to sigma renderer or CanvasGraph transparently
 *   - Handles WebGL context loss (OS tab sleep) by falling back to canvas
 *
 * Data flow:
 *   1. Consumer passes pre-baked KnowledgeGraphData (settled x/y from generator)
 *   2. `pendingNodes` prop injects optimistic contribution nodes with tentative edges
 *   3. No layout computation on the client — breathing lives in the GPU shader
 */

import { useEffect, useRef, useCallback, useState, useMemo, useReducer } from 'react'
import { SigmaContainer, useLoadGraph, useRegisterEvents, useSigma } from '@react-sigma/core'
import Graph from 'graphology'

import type { KnowledgeGraphProps, KnowledgeNode, KnowledgeLink } from './types'
import { DOMAIN_COLORS, CONFIDENCE_OPACITY, STOP_WORDS, MIN_TITLE_LENGTH, MAX_TENTATIVE_EDGES } from './constants'
import { createGlowNodeProgram, type GlowProgramControl } from './GlowNodeProgram'
import { CanvasGraph, AccessibilityLayer } from './CanvasGraph'

// ─── WebGL detection ─────────────────────────────────────────────────────────

function detectWebGL(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    return !!(
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')
    )
  } catch {
    return false
  }
}

// ─── Node sizing ─────────────────────────────────────────────────────────────

function nodeSize(n: KnowledgeNode): number {
  return Math.max(3, Math.log(n.connectionCount + 1) * 5) *
    (n.type === 'entity' ? 1.3 : 1)
}

// ─── Tentative edge detection (client-side, zero server cost) ────────────────

function detectTentativeEdges(
  pendingId:     string,
  submittedText: string,
  existingNodes: KnowledgeNode[],
): KnowledgeLink[] {
  function escapeRegExp(s: string) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  const matches = existingNodes.filter((n) => {
    if (n.title.length < MIN_TITLE_LENGTH) return false
    if (STOP_WORDS.has(n.title.toLowerCase())) return false
    const pattern = new RegExp('\\b' + escapeRegExp(n.title) + '\\b', 'i')
    return pattern.test(submittedText)
  })

  // Sort by hub importance — most-connected first; show best connections, never silence
  matches.sort((a, b) => b.connectionCount - a.connectionCount)
  return matches.slice(0, MAX_TENTATIVE_EDGES).map((n) => ({
    source:    pendingId,
    target:    n.id,
    tentative: true,
  }))
}

// ─── Internal sub-components ─────────────────────────────────────────────────

interface LoadGraphProps {
  nodes: KnowledgeNode[]
  links: KnowledgeLink[]
}

function GraphLoader({ nodes, links }: LoadGraphProps) {
  const loadGraph = useLoadGraph()

  useEffect(() => {
    const graph = new Graph()

    for (const node of nodes) {
      const color   = DOMAIN_COLORS[node.domain] ?? DOMAIN_COLORS.default!
      const opacity = CONFIDENCE_OPACITY[node.confidence] ?? 0.8
      graph.addNode(node.id.trim(), {
        x:             node.x,
        y:             node.y,
        size:          nodeSize(node),
        color,
        label:         node.title,
        type:          'circle',
        // Custom attributes read by GlowNodeProgram
        vibrancy:      node.vibrancy,
        // Confidence → alpha baked into color string via opacity
        originalColor: color,
        opacity,
        summary:       node.summary,
        domain:        node.domain,
        nodeType:      node.type,
        confidence:    node.confidence,
        connectionCount: node.connectionCount,
      })
    }

    for (const link of links) {
      try {
        graph.addEdge(link.source.trim(), link.target.trim(), {
          color:     link.tentative ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.12)',
          size:      1,
          tentative: !!link.tentative,
          label:     link.label ?? '',
        })
      } catch {
        // Ignore duplicate edges or missing node references
      }
    }

    loadGraph(graph)
  }, [nodes, links, loadGraph])

  return null
}

interface ShaderAnimatorProps {
  ambient:       boolean
  reducedMotion: boolean
  control:       GlowProgramControl
}

function ShaderAnimator({ ambient, reducedMotion, control }: ShaderAnimatorProps) {
  const sigma = useSigma()

  useEffect(() => {
    // Update amplitude from ambient mode and motion preference
    control.amplitude     = reducedMotion ? 0 : ambient ? 0.012 : 0.006
    control.reducedMotion = reducedMotion

    let raf: number
    function loop() {
      sigma.refresh()
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [sigma, ambient, reducedMotion, control])

  return null
}

interface EventControllerProps {
  onNodeClick?:   (id: string) => void
  onFocusChange?: (id: string | null) => void
}

function EventController({ onNodeClick, onFocusChange }: EventControllerProps) {
  const registerEvents = useRegisterEvents()
  const sigma = useSigma()

  useEffect(() => {
    registerEvents({
      clickNode({ node }) {
        onNodeClick?.(node)
        onFocusChange?.(node)
      },
      clickStage() {
        // Click on empty canvas → return to ambient
        onFocusChange?.(null)
      },
    })
  }, [registerEvents, onNodeClick, onFocusChange, sigma])

  return null
}

interface FocusControllerProps {
  focusedId: string | null
}

function FocusController({ focusedId }: FocusControllerProps) {
  const sigma = useSigma()

  useEffect(() => {
    if (!focusedId) {
      // Ambient: full display for all nodes
      sigma.setSetting('nodeReducer', null)
      sigma.setSetting('edgeReducer', null)
      sigma.setSetting('labelRenderedSizeThreshold', 12)
      return
    }

    const graph = sigma.getGraph()

    sigma.setSetting('nodeReducer', (node, data) => {
      const isFocused   = node === focusedId
      const isNeighbor  = graph.neighbors(focusedId).includes(node)
      if (isFocused || isNeighbor) return data
      // Non-ego nodes recede to near-invisible
      return { ...data, color: 'rgba(255,255,255,0.04)', size: data.size * 0.4, zIndex: 0 }
    })

    sigma.setSetting('edgeReducer', (edge, data) => {
      const endpoints = graph.extremities(edge)
      if (!endpoints.includes(focusedId)) return { ...data, hidden: true }
      return data
    })

    sigma.setSetting('labelRenderedSizeThreshold', 4)

    // Animate camera to focused node
    const nodeAttrs = graph.getNodeAttributes(focusedId)
    const camera    = sigma.getCamera()
    camera.animate({ x: nodeAttrs.x, y: nodeAttrs.y, ratio: 0.3 }, { duration: 500 })
  }, [focusedId, sigma])

  return null
}

// ─── Zoom-adaptive label threshold ───────────────────────────────────────────

function ZoomAdaptiveLabels() {
  const sigma = useSigma()

  useEffect(() => {
    const camera = sigma.getCamera()
    const handler = () => {
      sigma.setSetting(
        'labelRenderedSizeThreshold',
        camera.ratio > 0.5 ? Infinity : 8,
      )
    }
    camera.addListener('updated', handler)
    return () => { camera.removeListener('updated', handler) }
  }, [sigma])

  return null
}

// ─── Cluster domain labels ────────────────────────────────────────────────────
// Rendered as React overlays using sigma's graph-to-screen coordinate conversion

function ClusterLabels() {
  const sigma = useSigma()
  const [labels, setLabels] = useState<Array<{ domain: string; x: number; y: number }>>([])

  useEffect(() => {
    const graph = sigma.getGraph()

    // Compute centroid per domain
    const centroids = new Map<string, { sx: number; sy: number; count: number }>()
    graph.forEachNode((_node: string, attrs: Record<string, unknown>) => {
      const d     = attrs.domain as string
      const entry = centroids.get(d) ?? { sx: 0, sy: 0, count: 0 }
      entry.sx   += attrs.x as number
      entry.sy   += attrs.y as number
      entry.count++
      centroids.set(d, entry)
    })

    const nextLabels: typeof labels = []
    for (const [domain, { sx, sy, count }] of centroids) {
      const graphPt    = { x: sx / count, y: sy / count }
      const screenPt   = sigma.graphToViewport(graphPt)
      nextLabels.push({ domain, x: screenPt.x, y: screenPt.y })
    }
    setLabels(nextLabels)
  }, [sigma])

  return (
    <>
      {labels.map(({ domain, x, y }) => (
        <div
          key={domain}
          className="absolute pointer-events-none select-none text-2xl font-light tracking-widest uppercase"
          style={{
            left:      x,
            top:       y,
            transform: 'translate(-50%, -50%)',
            color:     DOMAIN_COLORS[domain] ?? DOMAIN_COLORS.default,
            opacity:   0.12,
          }}
        >
          {domain}
        </div>
      ))}
    </>
  )
}

// ─── Search overlay ───────────────────────────────────────────────────────────

interface SearchOverlayProps {
  nodes:   KnowledgeNode[]
  onSelect: (id: string) => void
}

function SearchOverlay({ nodes, onSelect }: SearchOverlayProps) {
  const [open,  setOpen]  = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((v) => !v)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  const filtered = useMemo(() => {
    if (!query.trim()) return nodes.slice(0, 12)
    const q = query.toLowerCase()
    return nodes
      .filter((n) =>
        n.title.toLowerCase().includes(q) ||
        n.domain.toLowerCase().includes(q) ||
        n.type.toLowerCase().includes(q),
      )
      .slice(0, 12)
  }, [nodes, query])

  return (
    <>
      {/* Persistent search button — always visible, primary affordance on mobile */}
      <button
        aria-label="Search knowledge graph"
        onClick={() => setOpen(true)}
        className="absolute bottom-6 right-6 z-20 flex items-center gap-2 rounded-full border border-border bg-background/80 backdrop-blur-sm px-4 py-2 text-sm text-foreground/70 shadow-lg transition-colors hover:bg-background hover:text-foreground"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        Search graph
      </button>

      {/* Search overlay */}
      {open && (
        <div
          className="absolute inset-0 z-30 flex items-start justify-center pt-24"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div className="w-full max-w-lg mx-6 rounded-xl border border-border bg-background shadow-2xl overflow-hidden">
            <div className="flex items-center border-b border-border px-4">
              <svg className="w-4 h-4 text-foreground/40 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                placeholder="Search nodes…"
                aria-label="Search knowledge graph"
                className="flex-1 bg-transparent px-3 py-4 text-sm text-foreground placeholder:text-foreground/30 outline-none"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <kbd className="hidden md:inline text-xs text-foreground/30 font-mono border border-border rounded px-1.5 py-0.5 ml-2">
                esc
              </kbd>
            </div>

            <ul className="max-h-80 overflow-y-auto py-2" role="listbox">
              {filtered.map((node) => (
                <li key={node.id} role="option">
                  <button
                    className="w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-foreground/5 transition-colors"
                    onClick={() => {
                      onSelect(node.id)
                      setOpen(false)
                      setQuery('')
                    }}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ background: DOMAIN_COLORS[node.domain] ?? DOMAIN_COLORS.default }}
                    />
                    <span className="flex-1 text-sm font-medium text-foreground truncate">
                      {node.title}
                    </span>
                    <span className="text-xs text-foreground/40 shrink-0">{node.domain}</span>
                  </button>
                </li>
              ))}
              {filtered.length === 0 && (
                <li className="px-4 py-6 text-sm text-foreground/40 text-center">
                  No results for "{query}"
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </>
  )
}

// ─── Focus tooltip panel ──────────────────────────────────────────────────────

interface TooltipPanelProps {
  node:       KnowledgeNode | null
  onClose:    () => void
  neighborCount: number
}

function TooltipPanel({ node, onClose, neighborCount }: TooltipPanelProps) {
  if (!node) return null
  return (
    <div
      className="absolute bottom-20 left-6 right-6 md:left-auto md:right-6 md:bottom-6 md:w-80 z-20 rounded-lg border border-border bg-background/90 backdrop-blur-sm p-4 shadow-xl"
    >
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute top-3 right-3 text-foreground/30 hover:text-foreground/60 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="flex items-center gap-2 mb-2">
        <span
          className="w-2 h-2 rounded-full"
          style={{ background: DOMAIN_COLORS[node.domain] ?? DOMAIN_COLORS.default }}
        />
        <span className="text-xs uppercase tracking-widest text-foreground/40">{node.type}</span>
        <span className="text-xs text-foreground/30">·</span>
        <span className="text-xs text-foreground/40">{node.domain}</span>
        <span className="text-xs text-foreground/30">·</span>
        <span className="text-xs text-foreground/40">{node.confidence}</span>
      </div>

      <p className="font-semibold text-foreground leading-tight mb-2">
        {node.title}
        {node.confidence === 'pending' && (
          <span className="ml-2 text-xs font-normal text-foreground/40"> ·· pending</span>
        )}
      </p>

      {node.summary && (
        <p className="text-sm text-foreground/60 leading-relaxed mb-3 line-clamp-3">
          {node.summary}
        </p>
      )}

      <div className="flex items-center justify-between">
        <span className="text-xs text-foreground/30">
          {neighborCount} direct connection{neighborCount !== 1 ? 's' : ''}
        </span>
        <a
          href={`/knowledge/wiki/${node.id}`}
          className="text-sm text-foreground/70 hover:text-foreground underline underline-offset-2 transition-colors"
        >
          Open wiki page →
        </a>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function KnowledgeGraph({
  data,
  onNodeClick,
  pendingNodes = [],
  ambient      = false,
  className,
}: KnowledgeGraphProps) {
  const [useWebGL]    = useState(() => detectWebGL())
  const [focusedId,   setFocusedId]   = useState<string | null>(null)
  const [contextLost, setContextLost] = useState(false)

  // Reduced motion
  const [reducedMotion] = useState(
    () =>
      typeof window !== 'undefined'
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false,
  )

  // Program control object — stable ref so sigma doesn't re-create the program
  const programControl = useRef<GlowProgramControl>({
    amplitude:    ambient ? 0.012 : 0.006,
    reducedMotion,
  })

  // Memoize the program class — must not change between renders
  const GlowNodeProgram = useMemo(
    () => createGlowNodeProgram(programControl.current),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  // Merge pending nodes + edges
  const allNodes = useMemo(
    () => [...data.nodes, ...pendingNodes],
    [data.nodes, pendingNodes],
  )

  const allLinks = useMemo(() => {
    const tentativeEdges = pendingNodes.flatMap((pn) =>
      detectTentativeEdges(pn.id, pn.summary, data.nodes),
    )
    return [...data.links, ...tentativeEdges]
  }, [data.links, data.nodes, pendingNodes])

  const focusedNode = focusedId
    ? allNodes.find((n) => n.id === focusedId) ?? null
    : null

  const neighborIds = useMemo(() => {
    if (!focusedId) return new Set<string>()
    const ids = new Set<string>()
    for (const link of allLinks) {
      if (link.source === focusedId) ids.add(link.target)
      if (link.target === focusedId) ids.add(link.source)
    }
    return ids
  }, [focusedId, allLinks])

  const handleFocus = useCallback((id: string | null) => {
    setFocusedId(id)
    if (id) onNodeClick?.(id)
  }, [onNodeClick])

  // Canvas fallback when WebGL unavailable or context lost
  if (!useWebGL || contextLost) {
    return (
      <div className={`relative w-full h-full ${className ?? ''}`}>
        <CanvasGraph
          data={{ ...data, nodes: allNodes, links: allLinks }}
          onNodeFocus={handleFocus}
          reducedMotion={reducedMotion}
          className="w-full h-full"
        />
      </div>
    )
  }

  return (
    <div className={`relative w-full h-full ${className ?? ''}`}>
      <SigmaContainer
        style={{ width: '100%', height: '100%', background: 'var(--background)' }}
        settings={{
          nodeProgramClasses:    { circle: GlowNodeProgram },
          renderEdgeLabels:      false,
          labelSize:             11,
          labelColor:            { color: 'rgba(255,255,255,0.7)' },
          defaultEdgeColor:      'rgba(255,255,255,0.12)',
          defaultEdgeType:       'line',
          allowInvalidContainer: true,
          // Do NOT use hideEdgesOnMove — kills the breathing effect
        }}
      >
        <GraphLoader nodes={allNodes} links={allLinks} />
        <ShaderAnimator
          ambient={ambient}
          reducedMotion={reducedMotion}
          control={programControl.current}
        />
        <EventController
          onNodeClick={onNodeClick}
          onFocusChange={handleFocus}
        />
        <FocusController focusedId={focusedId} />
        <ZoomAdaptiveLabels />
        <ClusterLabels />

        {/* WebGL context loss handler */}
        <WebGLContextGuard onContextLost={() => setContextLost(true)} />
      </SigmaContainer>

      {/* Search overlay — primary wayfinding at scale */}
      <SearchOverlay nodes={allNodes} onSelect={(id) => handleFocus(id)} />

      {/* Focus tooltip panel */}
      <TooltipPanel
        node={focusedNode}
        onClose={() => handleFocus(null)}
        neighborCount={neighborIds.size}
      />

      {/* Accessibility: sr-only traversal layer */}
      <AccessibilityLayer
        data={{ ...data, nodes: allNodes, links: allLinks }}
        focusedNode={focusedNode}
        neighborIds={neighborIds}
        onNodeFocus={handleFocus}
      />
    </div>
  )
}

// ─── WebGL context loss guard ─────────────────────────────────────────────────

function WebGLContextGuard({ onContextLost }: { onContextLost: () => void }) {
  const sigma = useSigma()

  useEffect(() => {
    const canvas = sigma.getCanvases().webgl as HTMLCanvasElement | undefined
    if (!canvas) return

    function handleLost(e: Event) {
      e.preventDefault()
      // Attempt recovery after a short delay
      setTimeout(() => {
        const gl = canvas!.getContext('webgl')
        if (!gl) onContextLost()
        // If context restored, sigma will auto-recover; no action needed
      }, 500)
    }

    canvas.addEventListener('webglcontextlost', handleLost)
    return () => canvas.removeEventListener('webglcontextlost', handleLost)
  }, [sigma, onContextLost])

  return null
}
