'use client'

import { useEffect, useRef, useState } from 'react'
import { Graph } from '@cosmos.gl/graph'
import type { KnowledgeGraphProps } from './types'
import { prepareGraph } from './data/toFloat32'
import { LabelLayer } from './labels/LabelLayer'
import { DEFAULT_LOD_VISIBILITY } from './lod/defaults'
import { useAmbientDrift } from './motion/useAmbientDrift'
import { useFocus } from './motion/useFocus'
import { usePrefersReducedMotion } from './motion/usePrefersReducedMotion'

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
  tierColors,
  tierSizes,
  backgroundColor = 'transparent',
  className,
  showLabels    = true,
  lodVisibility,
  onZoomChange,
  ambientDrift  = true,
  focus,
  focusRadius   = 1,
  focusDuration = 800,
}: KnowledgeGraphProps) {
  const wrapperRef   = useRef<HTMLDivElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const graphRef     = useRef<Graph | null>(null)
  const indexToIdRef = useRef<string[]>([])

  // Latest callback closures held in refs so the Graph instance picks up new
  // closures without being torn down and rebuilt on every render.
  const clickHandlerRef = useRef<typeof onNodeClick>(onNodeClick)
  clickHandlerRef.current = onNodeClick
  const zoomChangeRef = useRef<typeof onZoomChange>(onZoomChange)
  zoomChangeRef.current = onZoomChange

  const [zoomLevel, setZoomLevel] = useState(1)
  const [graphReady, setGraphReady] = useState(false)
  const [graphInstance, setGraphInstance] = useState<Graph | null>(null)

  const prefersReducedMotion = usePrefersReducedMotion()
  const driftEnabled = ambientDrift && !prefersReducedMotion

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const prepared = prepareGraph(data, tierColors, tierSizes)
    indexToIdRef.current = prepared.indexToId

    const graph = new Graph(container, {
      backgroundColor,
      enableSimulation:    false,
      // Default is 800ms — every setPointPositions call would queue a tween,
      // and at 60 Hz drift updates each tween gets replaced before completing
      // (visible result: no motion). Apply position updates instantly instead;
      // camera tweens (fitView, zoomToPointByIndex) take their own duration.
      transitionDuration:  0,
      pointSizeScale:      1,
      onPointClick: (index: number) => {
        const id = indexToIdRef.current[index]
        if (id) clickHandlerRef.current?.(id)
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
    }).catch(() => { /* ignore — destroyed before ready */ })

    return () => {
      setGraphReady(false)
      setGraphInstance(null)
      graph.destroy()
      graphRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, tierColors, tierSizes, backgroundColor])

  useAmbientDrift({
    graph:   graphInstance,
    ready:   graphReady,
    enabled: driftEnabled,
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
