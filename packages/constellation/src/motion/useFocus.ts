'use client'

import { useEffect, useMemo } from 'react'
import type { Graph } from '@cosmos.gl/graph'
import type { ConstellationData } from '../types'

interface FocusOptions {
  graph:          Graph | null
  ready:          boolean
  data:           ConstellationData
  /**
   * Node id to frame, or `null`/`undefined` to revert to the full-corpus view.
   * On change the camera tweens; cosmos.gl handles transition cancellation if
   * the value flips again mid-flight.
   */
  focus:          string | null | undefined
  /**
   * Hop radius around the focus node:
   *   0 → center + zoom on just the target
   *   1 → frame target + immediate neighbors (default)
   *   N → frame target + neighbors out to N hops (BFS)
   */
  focusRadius?:   number
  /** Animation duration in milliseconds. Default 800. */
  focusDuration?: number
  /** Padding fraction for fitView when focusRadius > 0. Default 0.2 (20%). */
  focusPadding?:  number
  /** Zoom scale for radius-0 focus. Default 4. */
  focusZoom?:     number
}

/**
 * Drive the camera to a target node (and optionally its N-hop neighborhood)
 * whenever the `focus` prop changes. Reverts to `fitView` when `focus` is
 * cleared.
 *
 * Multi-hop expansion is done in JS via repeated `getNeighboringPointIndices`
 * because cosmos.gl's API only returns 1-hop neighbors per call.
 */
export function useFocus({
  graph,
  ready,
  data,
  focus,
  focusRadius   = 1,
  focusDuration = 800,
  focusPadding  = 0.2,
  focusZoom     = 4,
}: FocusOptions) {
  // Stable id → index lookup; rebuilt only when `data` changes.
  const idToIndex = useMemo(() => {
    const map = new Map<string, number>()
    data.nodes.forEach((n, i) => map.set(n.id, i))
    return map
  }, [data])

  useEffect(() => {
    if (!graph || !ready) return

    if (!focus) {
      graph.fitView(focusDuration, focusPadding)
      return
    }

    const targetIndex = idToIndex.get(focus)
    if (targetIndex === undefined) return

    if (focusRadius <= 0) {
      graph.zoomToPointByIndex(targetIndex, focusDuration, focusZoom)
      return
    }

    // BFS to collect indices within `focusRadius` hops.
    const visited = new Set<number>([targetIndex])
    let frontier: number[] = [targetIndex]
    for (let hop = 0; hop < focusRadius; hop++) {
      const next: number[] = []
      for (const idx of frontier) {
        for (const neighbor of graph.getNeighboringPointIndices(idx)) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor)
            next.push(neighbor)
          }
        }
      }
      frontier = next
      if (frontier.length === 0) break
    }

    graph.fitViewByPointIndices(
      Array.from(visited),
      focusDuration,
      focusPadding,
    )
  }, [graph, ready, idToIndex, focus, focusRadius, focusDuration, focusPadding, focusZoom])
}
