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
type Tier = 'domain' | 'tradition' | 'work' | 'section' | 'quote' | 'synthesis'

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
  type:   'hierarchy' | 'contains' | 'cites' | 'member_of' | 'synthesizes' | 'semantic'
}

interface ConstellationData {
  nodes: ConstellationNode[]
  links: ConstellationLink[]
  generatedAt: number
}
```

The generator that produces this shape lives at `scripts/knowledge/generate-constellation-graph.ts` in the OpenCosmos consumer repo.

## Bringing nodes forward

`highlightedNodeIds` lights a subset and dims the rest — the mechanism behind "show me what this answer is drawing on."

```tsx
<KnowledgeGraph
  data={data}
  highlightedNodeIds={citedIds}   // brighten + swell these, dim everything else
  highlightPulse                   // breathe them; auto-off under reduced motion
  focus={citedIds[0] ?? null}      // and point the camera at the first one
/>
```

Highlighting and `focus` are deliberately separate: highlighting says *what matters right now*, focus says *where the camera looks*. A chat surface typically highlights every citation in a response but only moves the camera once.

## What's in the current alpha

- `<KnowledgeGraph data={...}>` mounts `@cosmos.gl/graph` and renders nodes + links from typed Float32 arrays.
- Tier-aware default colors and sizes (override via `tierColors` / `tierSizes` props).
- Built-in force simulation is **disabled** — the component honors the pre-computed positions from the generator's ForceAtlas2 pass.
- HTML label overlay with **tier-aware LOD**: traditions are always labeled, works/sections/quotes resolve as the user zooms in. Labels are sampled (cosmos.gl's `pointSamplingDistance` controls density), so density stays manageable at every zoom level. Override per tier via `lodVisibility={{ tradition: 0, work: 1.5, section: 3, quote: 6 }}` or disable entirely with `showLabels={false}`.
- **Labels never overlap.** When two would collide, the structurally more important one wins (domain → tradition → synthesis → work → section → quote, then by degree), so a dense cluster resolves to the anchor that names it rather than a pile of superimposed titles. Tune with `DEFAULT_LABEL_MIN_GAP_PX`.
- `onNodeClick(id)` callback fires with the node's id (not its index).
- `onZoomChange(zoom)` callback fires on every pan/zoom event for consumer-side legends/mini-maps. Throttle in the consumer if your UI is expensive to re-render.
- `fitView()` runs once on first ready so the entire constellation is visible.
- **Ambient drift** (`ambientDrift`) applies a low-amplitude per-node sine perturbation so the field breathes rather than sitting frozen. Auto-disabled under `prefers-reduced-motion`.
- **Programmatic focus** (`focus`, `focusRadius`, `focusDuration`) tweens the camera to a node and its N-hop neighborhood; clearing it returns to the full corpus.
- **Highlighting** (`highlightedNodeIds`, `highlightPulse`) — see above.

## What's coming

| Feature | Target |
|---|---|
| `@opencosmos/tokens` theme integration | next |
| Edge opacity / width scaling with zoom | next |
| Differentiated `semantic` edge rendering (thinner, lower opacity) | nice-to-have |
| Label collision avoidance | post-1.0 |

## License

MIT — same as the underlying `@cosmos.gl/graph` engine.
