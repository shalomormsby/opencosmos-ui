# @opencosmos/constellation

Living knowledge-graph visualizer for OpenCosmos. A React wrapper around [`@cosmos.gl/graph`](https://github.com/cosmosgl/graph) (MIT) that renders **tradition · work · section · quote** tiers as a navigable starfield.

> **Status:** alpha — labels + tier-aware LOD landed; ambient motion, focus targeting, and theme integration coming next.

## Install

```bash
pnpm add @opencosmos/constellation
```

Peer requirements: `react ^18 || ^19`.

## Usage

```tsx
'use client'

import dynamic from 'next/dynamic'

// SSR off — the renderer creates a WebGL context on mount.
const KnowledgeGraph = dynamic(
  () => import('@opencosmos/constellation').then((m) => m.KnowledgeGraph),
  { ssr: false },
)

export default function Page() {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch('/api/knowledge/constellation').then((r) => r.json()).then(setData)
  }, [])

  if (!data) return null
  return (
    <div className="h-screen w-screen">
      <KnowledgeGraph
        data={data}
        onNodeClick={(id) => console.log('clicked', id)}
        className="h-full w-full"
      />
    </div>
  )
}
```

## Data shape

```ts
type Tier = 'tradition' | 'work' | 'section' | 'quote'

interface ConstellationNode {
  id: string
  tier: Tier
  label: string
  x: number
  y: number
  // optional: domain, tradition, author, parent, category, provenanceStatus, degree
}

interface ConstellationLink {
  source: string  // node id
  target: string  // node id
  type:   'hierarchy' | 'contains' | 'cites' | 'member_of'
}

interface ConstellationData {
  nodes: ConstellationNode[]
  links: ConstellationLink[]
  generatedAt: number
}
```

The generator that produces this shape lives at `scripts/knowledge/generate-constellation-graph.ts` in the OpenCosmos consumer repo.

## What's in the current alpha

- `<KnowledgeGraph data={...}>` mounts `@cosmos.gl/graph` and renders nodes + links from typed Float32 arrays.
- Tier-aware default colors and sizes (override via `tierColors` / `tierSizes` props).
- Built-in force simulation is **disabled** — the component honors the pre-computed positions from the generator's ForceAtlas2 pass.
- HTML label overlay with **tier-aware LOD**: traditions are always labeled, works/sections/quotes resolve as the user zooms in. Labels are sampled (cosmos.gl's `pointSamplingDistance` controls density), so density stays manageable at every zoom level. Override per tier via `lodVisibility={{ tradition: 0, work: 1.5, section: 3, quote: 6 }}` or disable entirely with `showLabels={false}`.
- `onNodeClick(id)` callback fires with the node's id (not its index).
- `onZoomChange(zoom)` callback fires on every pan/zoom event for consumer-side legends/mini-maps. Throttle in the consumer if your UI is expensive to re-render.
- `fitView()` runs once on first ready so the entire constellation is visible.

## What's coming

| Feature | Target |
|---|---|
| Ambient drift respecting `prefers-reduced-motion` | next |
| Programmatic zoom-to-context (`focus={nodeId}`) | next |
| `@opencosmos/tokens` theme integration | after focus + motion |
| Edge opacity scaling with zoom | nice-to-have |
| Label collision avoidance | post-1.0 |

## License

MIT — same as the underlying `@cosmos.gl/graph` engine.
