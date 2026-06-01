'use client'

import { useEffect } from 'react'
import type { Graph } from '@cosmos.gl/graph'

interface AmbientDriftOptions {
  graph:      Graph | null
  ready:      boolean
  enabled:    boolean
  /**
   * Drift amplitude as a fraction of the rescaled position bounding-box.
   * `0.005` is ~half a percent — subtle breath. Reasonable range: `0.002`–`0.02`.
   */
  amplitude?: number
  /** Base angular frequency in rad/sec. Multiplied per-node by a small jitter. */
  speed?:     number
}

/**
 * Apply gentle low-frequency perturbation to point positions while the graph
 * is mounted. Each node gets a random phase offset on x and y, so the field
 * breathes asynchronously rather than pulsing in unison.
 *
 * Implementation:
 *   1. Wait until the graph is `ready` and `fitView` has settled positions.
 *   2. Capture the current positions via `getPointPositions()` as a base, and
 *      compute a bounding-box scale so the drift amplitude is invariant to
 *      cosmos.gl's auto-rescale (default `spaceSize: 4096`).
 *   3. On every animation frame: compute base + scale * sin(t * ω + φ) into a
 *      reusable buffer, push via `setPointPositions(buf, true)` (`dontRescale`),
 *      then call `graph.create()` to flush the change to the WebGL buffer.
 *   4. On unmount/disable, restore the captured base positions.
 *
 * Critical config requirement: cosmos must be configured with
 * `transitionDuration: 0`. Otherwise every per-frame setPointPositions call
 * queues an 800ms tween that gets replaced before completing — visible result:
 * no motion. (KnowledgeGraph.tsx sets this on the instance it owns.)
 */
export function useAmbientDrift({
  graph,
  ready,
  enabled,
  amplitude = 0.005,   // 0.5 % of bounding-box range
  speed     = 0.4,
}: AmbientDriftOptions) {
  useEffect(() => {
    if (!graph || !ready || !enabled || amplitude <= 0 || speed <= 0) return

    const positions = graph.getPointPositions()
    const n = positions.length / 2
    if (n === 0) return

    const base = new Float32Array(positions)

    // Bounding-box → scale-invariant amplitude. The largest of (x-range, y-range)
    // multiplied by `amplitude` gives the actual sine peak in the same units
    // cosmos uses internally after rescale.
    let minX = Infinity, maxX = -Infinity
    let minY = Infinity, maxY = -Infinity
    for (let i = 0; i < n; i++) {
      const x = base[i * 2]!
      const y = base[i * 2 + 1]!
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    }
    const range = Math.max(maxX - minX, maxY - minY, 1)
    const peak  = range * amplitude

    const phases = new Float32Array(n * 2)
    const frequencies = new Float32Array(n)
    for (let i = 0; i < n; i++) {
      phases[i * 2]     = Math.random() * Math.PI * 2
      phases[i * 2 + 1] = Math.random() * Math.PI * 2
      frequencies[i] = 0.7 + Math.random() * 0.6   // 0.7×–1.3×
    }
    const buffer = new Float32Array(n * 2)

    let frameId: number | null = null
    const startTime = performance.now()

    const tick = (now: number) => {
      const t = (now - startTime) * 0.001
      for (let i = 0; i < n; i++) {
        const omega = speed * frequencies[i]!
        const phaseX = phases[i * 2]!
        const phaseY = phases[i * 2 + 1]!
        buffer[i * 2]     = base[i * 2]!     + peak * Math.sin(t * omega + phaseX)
        buffer[i * 2 + 1] = base[i * 2 + 1]! + peak * Math.cos(t * omega + phaseY)
      }
      // setPointPositions only queues the data; with `enableSimulation: false`
      // cosmos's internal render loop is dormant when there's no transition or
      // user interaction, so `create()` (which applies pending data without
      // painting) is invisible. `render()` both applies pending changes AND
      // paints a frame — that's the API that makes drift actually move pixels.
      // Pass `simulationAlpha: 0` so cosmos doesn't accidentally try to step a
      // disabled simulation.
      graph.setPointPositions(buffer, true)
      graph.render(0)
      frameId = requestAnimationFrame(tick)
    }

    frameId = requestAnimationFrame(tick)

    return () => {
      if (frameId !== null) cancelAnimationFrame(frameId)
      try {
        graph.setPointPositions(base, true)
        graph.render(0)
      } catch {
        /* graph may have been destroyed before cleanup ran */
      }
    }
  }, [graph, ready, enabled, amplitude, speed])
}
