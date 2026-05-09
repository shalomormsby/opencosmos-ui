---
"@opencosmos/constellation": patch
---

Initial release of `@opencosmos/constellation` — a React wrapper around `@cosmos.gl/graph` that renders OpenCosmos's knowledge graph as a tier-aware starfield (`tradition` · `work` · `section` · `quote`).

- `<KnowledgeGraph>` mounts cosmos.gl, prepares Float32 buffers, applies tier-aware default colors and sizes, and exposes `onNodeClick(id)` plus an imperative `fitView()`.
- HTML label overlay with tier-aware level-of-detail (default thresholds: `tradition: 0`, `work: 1.5×`, `section: 3×`, `quote: 6×`) so dense regions stay readable.
- Focus targeting via `focus` / `focusRadius` / `focusDuration` props, with multi-hop BFS expansion (cosmos.gl's neighbor lookup is single-hop only).
- Ambient drift hook scaffolded but **not yet visibly working** at this version — parked behind edge-density work; consumers should treat ambient motion as a no-op for now.
