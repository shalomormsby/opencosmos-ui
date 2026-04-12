---
"@opencosmos/ui": minor
---

Add `@opencosmos/ui/knowledge-graph` subpath export — sigma.js v3 WebGL constellation renderer for the OpenCosmos knowledge graph.

New exports via `@opencosmos/ui/knowledge-graph`:
- `KnowledgeGraph` — React component with sigma.js v3 WebGL renderer (custom `GlowNodeProgram` with additive blending and per-node breathing animation), three-layer canvas fallback for Safari/iOS, `SearchOverlay` (⌘K), focus/ego-network mode, and `AccessibilityLayer`
- `DOMAIN_COLORS` — domain → hex color mapping
- `CONFIDENCE_OPACITY` — confidence level → opacity mapping
- Types: `KnowledgeGraphData`, `KnowledgeNode`, `KnowledgeLink`, `KnowledgePreviewData`, `KnowledgeGraphProps`

`sigma`, `graphology`, `@react-sigma/core`, and `graphology-layout-forceatlas2` added as optional peer dependencies.
