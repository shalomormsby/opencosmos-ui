'use client'

import dynamic from 'next/dynamic'
import { useEffect, useMemo, useState } from 'react'
import type { ConstellationData, Tier } from '@opencosmos/constellation'
import { DEFAULT_LOD_VISIBILITY, DEFAULT_TIER_COLORS } from '@opencosmos/constellation'

// SSR off — the renderer creates a WebGL context on mount.
const KnowledgeGraph = dynamic(
  () => import('@opencosmos/constellation').then((m) => m.KnowledgeGraph),
  { ssr: false },
)

const TIER_ORDER: Tier[] = ['tradition', 'synthesis', 'work', 'section', 'quote']

/**
 * Demo page exercising the constellation alpha:
 *   - Tier-aware colors and sizes
 *   - HTML label overlay with LOD (zoom panel reflects which tiers resolve)
 *   - Ambient drift (toggle in panel; auto-off under prefers-reduced-motion)
 *   - Focus targeting (work selector → camera tweens to that work + neighbors)
 */
export default function ConstellationDemoPage() {
  const [data, setData] = useState<ConstellationData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [clickedNode, setClickedNode] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [drift, setDrift] = useState(true)
  const [focus, setFocus] = useState<string | null>(null)

  useEffect(() => {
    fetch('/constellation-sample.json')
      .then((r) => {
        if (!r.ok) throw new Error(`fetch failed: ${r.status}`)
        return r.json() as Promise<ConstellationData>
      })
      .then(setData)
      .catch((e) => setError(String(e)))
  }, [])

  const tierCounts = useMemo(() => {
    if (!data) return null
    return data.nodes.reduce<Record<string, number>>((acc, n) => {
      acc[n.tier] = (acc[n.tier] ?? 0) + 1
      return acc
    }, {})
  }, [data])

  // Sorted list of works for the focus selector.
  const workOptions = useMemo(() => {
    if (!data) return []
    return data.nodes
      .filter((n) => n.tier === 'work')
      .map((n) => ({ id: n.id, label: n.label }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [data])

  return (
    <div className="relative h-screen w-screen bg-[#0b0d12] text-white">
      <div className="absolute top-4 left-4 z-10 max-w-md rounded-lg bg-black/60 p-4 backdrop-blur">
        <h1 className="mb-1 text-lg font-semibold">@opencosmos/constellation</h1>
        <p className="mb-3 text-xs opacity-70">
          Mint nodes are wiki bridges — concepts and entities that synthesize
          works across traditions. Labels resolve by tier as you zoom in.
          Pick a work to fly the camera to that subgraph.
        </p>

        {tierCounts && (
          <div className="space-y-1 text-xs">
            {TIER_ORDER.map((tier) => {
              const minZoom = DEFAULT_LOD_VISIBILITY[tier] ?? 0
              const visible = zoom >= minZoom
              return (
                <div key={tier} className="flex items-center gap-2">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: DEFAULT_TIER_COLORS[tier] }}
                  />
                  <span className="w-20 capitalize">{tier}</span>
                  <span className="w-10 opacity-70 tabular-nums">{tierCounts[tier] ?? 0}</span>
                  <span
                    className="w-16 text-right tabular-nums"
                    style={{ opacity: visible ? 0.85 : 0.35 }}
                  >
                    ≥ {minZoom}×
                  </span>
                  <span
                    className="w-3"
                    style={{ opacity: visible ? 1 : 0.2, color: visible ? '#7aa2ff' : 'inherit' }}
                  >
                    {visible ? '●' : '○'}
                  </span>
                </div>
              )
            })}
            <div className="flex justify-between pt-1 opacity-60">
              <span>{data!.nodes.length} nodes · {data!.links.length} edges</span>
              <span className="tabular-nums">zoom {zoom.toFixed(2)}×</span>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="mt-3 space-y-2 border-t border-white/10 pt-3 text-xs">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={drift}
              onChange={(e) => setDrift(e.target.checked)}
              className="accent-[#7aa2ff]"
            />
            <span>Ambient drift</span>
            <span className="opacity-50">(auto-off if reduced-motion)</span>
          </label>

          <div className="flex items-center gap-2">
            <label htmlFor="focus" className="w-20 shrink-0">Focus</label>
            <select
              id="focus"
              value={focus ?? ''}
              onChange={(e) => setFocus(e.target.value || null)}
              className="flex-1 min-w-0 rounded bg-white/10 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-inset focus:ring-[#7aa2ff]"
            >
              <option value="">— full constellation —</option>
              {workOptions.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.label}
                </option>
              ))}
            </select>
            {focus && (
              <button
                type="button"
                onClick={() => setFocus(null)}
                className="rounded bg-white/10 px-2 py-1 text-xs hover:bg-white/20"
              >
                clear
              </button>
            )}
          </div>
        </div>

        {clickedNode && (
          <div className="mt-3 border-t border-white/10 pt-3 text-xs">
            <span className="opacity-60">last click: </span>
            <code className="break-all">{clickedNode}</code>
          </div>
        )}

        {error && (
          <p className="mt-3 text-xs text-red-400">Failed to load sample: {error}</p>
        )}
      </div>

      {data && (
        <KnowledgeGraph
          data={data}
          onNodeClick={setClickedNode}
          onZoomChange={setZoom}
          ambientDrift={drift}
          focus={focus}
          focusRadius={1}
          backgroundColor="#0b0d12"
          className="absolute inset-0 h-full w-full"
        />
      )}
    </div>
  )
}
