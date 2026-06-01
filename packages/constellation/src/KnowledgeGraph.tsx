'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Graph } from '@cosmos.gl/graph'
import type { KnowledgeGraphApi, KnowledgeGraphProps } from './types'
import { prepareGraph } from './data/toFloat32'
import { LabelLayer } from './labels/LabelLayer'
import { DEFAULT_LOD_VISIBILITY } from './lod/defaults'
import { useAmbientDrift } from './motion/useAmbientDrift'
import { useFocus } from './motion/useFocus'
import { usePrefersReducedMotion } from './motion/usePrefersReducedMotion'

/** Default focus ring — warm white at 65% alpha. Stands out against the dark canvas. */
const DEFAULT_FOCUS_RING:   [number, number, number, number] = [1, 0.95, 0.85, 0.65]
/** Default hover ring — same hue, lower alpha so it doesn't compete with focus. */
const DEFAULT_HOVER_RING:   [number, number, number, number] = [1, 0.95, 0.85, 0.35]

/**
 * Constellation knowledge-graph renderer.
 *
 * Layers, in render order:
 *   1. WebGL canvas (cosmos.gl) — points + links from prepared Float32 arrays
 *   2. HTML label overlay (`LabelLayer`) — sampled, tier-aware LOD
 *
 * Behaviors composed via hooks:
 *   - `useAmbientDrift`  → low-amplitude per-node sine drift in data space
 *   - `useFocus`         → camera tween to a target node + N-hop neighborhood
 *   - `usePrefersReducedMotion` → auto-disable drift when the user opts out
 *
 * Out of scope (tracked for later):
 *   - `@opencosmos/tokens` theme integration
 *   - Edge opacity / weight scaling with zoom
 *   - Label collision avoidance
 *
 * SSR note: this component instantiates WebGL on mount. Consumers must avoid
 * rendering it during server render (e.g. `next/dynamic` with `ssr: false`).
 */
export function KnowledgeGraph({
  data,
  onNodeClick,
  onNodeHover,
  tierColors,
  tierSizes,
  pointSizeByDegree = 0,
  backgroundColor = 'transparent',
  className,
  showLabels    = true,
  lodVisibility,
  onZoomChange,
  ambientDrift  = true,
  focus,
  focusRadius   = 1,
  focusDuration = 800,
  focusedPointRingColor,
  hoveredPointRingColor,
  onReady,
}: KnowledgeGraphProps) {
  const wrapperRef   = useRef<HTMLDivElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const graphRef     = useRef<Graph | null>(null)
  const indexToIdRef = useRef<string[]>([])
  const idToIndexRef = useRef<Map<string, number>>(new Map())

  // Latest callback closures held in refs so the Graph instance picks up new
  // closures without being torn down and rebuilt on every render.
  const clickHandlerRef = useRef<typeof onNodeClick>(onNodeClick)
  clickHandlerRef.current = onNodeClick
  const hoverHandlerRef = useRef<typeof onNodeHover>(onNodeHover)
  hoverHandlerRef.current = onNodeHover
  const zoomChangeRef = useRef<typeof onZoomChange>(onZoomChange)
  zoomChangeRef.current = onZoomChange
  const readyHandlerRef = useRef<typeof onReady>(onReady)
  readyHandlerRef.current = onReady

  const [zoomLevel, setZoomLevel] = useState(1)
  const [graphReady, setGraphReady] = useState(false)
  const [graphInstance, setGraphInstance] = useState<Graph | null>(null)

  const prefersReducedMotion = usePrefersReducedMotion()

  // Normalize ambientDrift prop. `true` → defaults, `false` → off,
  // `{ … }` → tuned by consumer (slower / quieter on explore pages).
  const { driftEnabled, driftAmplitude, driftSpeed } = useMemo(() => {
    if (prefersReducedMotion || ambientDrift === false) {
      return { driftEnabled: false, driftAmplitude: 0, driftSpeed: 0 }
    }
    if (ambientDrift === true) {
      return { driftEnabled: true,  driftAmplitude: 0.005, driftSpeed: 0.4 }
    }
    return {
      driftEnabled:   true,
      driftAmplitude: ambientDrift?.amplitude ?? 0.005,
      driftSpeed:     ambientDrift?.speed     ?? 0.4,
    }
  }, [ambientDrift, prefersReducedMotion])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const prepared = prepareGraph(data, tierColors, tierSizes, pointSizeByDegree)
    indexToIdRef.current = prepared.indexToId
    idToIndexRef.current = prepared.idToIndex

    const graph = new Graph(container, {
      backgroundColor,
      enableSimulation:    false,
      // Default is 800ms — every setPointPositions call would queue a tween,
      // and at 60 Hz drift updates each tween gets replaced before completing
      // (visible result: no motion). Apply position updates instantly instead;
      // camera tweens (fitView, zoomToPointByIndex) take their own duration.
      transitionDuration:  0,
      pointSizeScale:      1,
      // Native cosmos rings for hover and focus — much cheaper than a custom
      // overlay layer and stays pixel-aligned through pan/zoom/drift.
      focusedPointRingColor: focusedPointRingColor ?? DEFAULT_FOCUS_RING,
      hoveredPointRingColor: hoveredPointRingColor ?? DEFAULT_HOVER_RING,
      hoveredPointCursor:    'pointer',
      onPointClick: (index: number) => {
        const id = indexToIdRef.current[index]
        if (id) clickHandlerRef.current?.(id)
      },
      onPointMouseOver: (index: number) => {
        const id = indexToIdRef.current[index]
        if (id) hoverHandlerRef.current?.(id)
      },
      onPointMouseOut: () => {
        hoverHandlerRef.current?.(null)
      },
      onZoom: (e) => {
        const z = e.transform.k
        setZoomLevel(z)
        zoomChangeRef.current?.(z)
      },
    })
    graphRef.current = graph
    setGraphInstance(graph)

    graph.setPointPositions(prepared.positions)
    graph.setPointColors(prepared.colors)
    graph.setPointSizes(prepared.sizes)
    graph.setLinks(prepared.links)
    graph.setLinkColors(prepared.linkColors)
    graph.setLinkWidths(prepared.linkWidths)
    graph.render()

    graph.ready.then(() => {
      graph.fitView(400, 0.1)
      setGraphReady(true)
      // Hand the consumer an imperative API for actions that don't map cleanly
      // onto props (Fit-view button, reset, programmatic refit).
      readyHandlerRef.current?.({
        fitView:      (durationMs = 600, padding = 0.1) => graph.fitView(durationMs, padding),
        getNodeIndex: (id: string)  => idToIndexRef.current.get(id) ?? null,
      } satisfies KnowledgeGraphApi)
    }).catch(() => { /* ignore — destroyed before ready */ })

    return () => {
      setGraphReady(false)
      setGraphInstance(null)
      graph.destroy()
      graphRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, tierColors, tierSizes, pointSizeByDegree, backgroundColor])

  // Keep cosmos's native focus ring in sync with the React `focus` prop.
  // Done via setConfigPartial so the WebGL instance is not rebuilt.
  useEffect(() => {
    const graph = graphRef.current
    if (!graph || !graphReady) return
    if (focus) {
      const idx = idToIndexRef.current.get(focus)
      if (idx !== undefined) graph.setConfigPartial({ focusedPointIndex: idx })
    } else {
      graph.setConfigPartial({ focusedPointIndex: undefined })
    }
  }, [focus, graphReady])

  useAmbientDrift({
    graph:     graphInstance,
    ready:     graphReady,
    enabled:   driftEnabled,
    amplitude: driftAmplitude,
    speed:     driftSpeed,
  })

  useFocus({
    graph: graphInstance,
    ready: graphReady,
    data,
    focus,
    focusRadius,
    focusDuration,
  })

  const lodRules = lodVisibility ?? DEFAULT_LOD_VISIBILITY

  return (
    <div
      ref={wrapperRef}
      className={className}
      style={{ position: 'relative' }}
    >
      <div
        ref={containerRef}
        style={{ position: 'absolute', inset: 0 }}
      />
      {graphReady && showLabels && graphInstance && (
        <LabelLayer
          graph={graphInstance}
          nodes={data.nodes}
          zoomLevel={zoomLevel}
          lodRules={lodRules}
        />
      )}
    </div>
  )
}
