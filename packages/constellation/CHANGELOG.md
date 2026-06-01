# @opencosmos/constellation

## 0.2.0 - 2026-05-18

### Phase 1.12 Release 1 — make the graph legible (consumer UX, leading)

This release lands the package surface needed for the first meaningful UX upgrade to OpenCosmos's `/knowledge/graph`. Each addition is small but unlocks a category of consumer behavior:

- **`onNodeHover`** — fires with the hovered node id (or `null` on mouse-out). Used by consumers to drive tooltip overlays and hover-state highlights. Cosmos.gl's native `hoveredPointRingColor` is wired by default so a soft warm-white ring appears under the cursor without any consumer work.
- **`pointSizeByDegree`** — a 0..1 factor that multiplies per-node size by `1 + log10(1 + degree) × factor`. Default `0` (off). Set `0.3` for a gentle hub/leaf differentiator — a degree-50 hub grows ~1.5×, orphans stay at their tier baseline. Lets the corpus's gravitational centers visibly stand out.
- **`ambientDrift: { amplitude, speed }`** — the existing boolean prop now also accepts an options object. `{ amplitude: 0.002, speed: 0.2 }` is recommended for explore/edit surfaces where users target labels; `{ amplitude: 0.005, speed: 0.4 }` (the current default for `true`) keeps the hero ambient feel.
- **`onReady`** — fires once with an imperative `{ fitView, getNodeIndex }` API after the initial fit-view settles. Lets consumers wire a "Reset view" button or programmatic refit without prop-drilling.
- **Native focus ring.** `focus` now also drives cosmos.gl's `focusedPointIndex` (via `setConfigPartial`, so the WebGL instance is not rebuilt). The focused node renders a soft warm-white halo, pixel-aligned through pan / zoom / drift. New `focusedPointRingColor` and `hoveredPointRingColor` props let consumers theme both rings.
- **`KnowledgeGraphApi` type** — exported from the package root for consumer ref typing.

### Internal

- `prepareGraph` now accepts a `pointSizeByDegree` factor and applies the degree multiplier in the size loop. Backward-compatible: default is `0`.
- `useAmbientDrift` gains a defensive `speed <= 0` guard alongside the existing `amplitude <= 0` short-circuit.
- `KnowledgeGraph` mounts cosmos with `hoveredPointCursor: 'pointer'` by default so the cursor signals interactivity over any node.

### Breaking changes

None. All new props default to current behavior; existing consumers see identical output.

### Migration

```diff
  <KnowledgeGraph
    data={data}
    onNodeClick={handleClick}
+   onNodeHover={(id) => setHovered(id)}
+   onReady={(api) => apiRef.current = api}
+   pointSizeByDegree={0.3}
-   ambientDrift={true}
+   ambientDrift={{ amplitude: 0.002, speed: 0.2 }}  // calmer on explore pages
  />
```

## 0.1.0 - 2026-05-09

### Patch Changes

- d6ced84: Initial release of `@opencosmos/constellation` — a React wrapper around `@cosmos.gl/graph` that renders OpenCosmos's knowledge graph as a tier-aware starfield (`tradition` · `work` · `section` · `quote`).

  - `<KnowledgeGraph>` mounts cosmos.gl, prepares Float32 buffers, applies tier-aware default colors and sizes, and exposes `onNodeClick(id)` plus an imperative `fitView()`.
  - HTML label overlay with tier-aware level-of-detail (default thresholds: `tradition: 0`, `work: 1.5×`, `section: 3×`, `quote: 6×`) so dense regions stay readable.
  - Focus targeting via `focus` / `focusRadius` / `focusDuration` props, with multi-hop BFS expansion (cosmos.gl's neighbor lookup is single-hop only).
  - Ambient drift hook scaffolded but **not yet visibly working** at this version — parked behind edge-density work; consumers should treat ambient motion as a no-op for now.
