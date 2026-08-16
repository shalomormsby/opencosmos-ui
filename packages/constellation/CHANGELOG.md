# @opencosmos/constellation

## 0.2.1 - 2026-08-16

### Patch Changes

- Fix `highlightedNodeIds` having no visible effect when `ambientDrift` is also on.

  Both features write point data and call `render()` every frame, and cosmos.gl commits only the most recent write — so the drift loop's per-frame position write consistently won, and the highlight never reached the canvas. Measured against a 700-node corpus: lighting two nodes dropped mean canvas luminance 8.9% with drift off, and 0.0% with it on.

  Drift now suspends while a highlight is active and resumes when it clears. The highlight is the feature carrying meaning — it should not be silently cancelled by ambience.

## 0.2.0 - 2026-08-16

### Minor Changes

- 9902e85: Add `highlightedNodeIds` — bring a subset of nodes forward while the rest recede — and stop labels from piling up on each other.

  **Highlighting.** `highlightedNodeIds` lights the named nodes (they brighten and swell) and dims everything else; `highlightPulse` breathes them rather than holding a fixed size, and auto-disables under `prefers-reduced-motion`. This is what a conversational surface drives: as a response cites passages, the corpus lights up along the path of the reasoning. Independent of `focus` — highlighting says what matters, focus says where the camera looks, and a chat typically highlights every citation but only moves the camera to the first.

  Implemented as a colors-and-sizes pass, so it composes with `ambientDrift` (which owns positions) rather than fighting it. The full dim/restore sweep runs once per change of the highlighted set; per-frame work touches only the lit indices, so a three-node highlight costs three writes a frame regardless of corpus size.

  **Label collision.** Labels are now culled when they would overlap one already placed, greedily in importance order (domain → tradition → synthesis → work → section → quote, then by degree) using a uniform grid. A dense cluster previously rendered as an unreadable pile of superimposed titles; it now resolves to the structural anchor that names it. `DEFAULT_LABEL_MIN_GAP_PX` is exported for corpora that want it looser or tighter.

## 0.1.0 - 2026-05-09

### Patch Changes

- d6ced84: Initial release of `@opencosmos/constellation` — a React wrapper around `@cosmos.gl/graph` that renders OpenCosmos's knowledge graph as a tier-aware starfield (`tradition` · `work` · `section` · `quote`).

  - `<KnowledgeGraph>` mounts cosmos.gl, prepares Float32 buffers, applies tier-aware default colors and sizes, and exposes `onNodeClick(id)` plus an imperative `fitView()`.
  - HTML label overlay with tier-aware level-of-detail (default thresholds: `tradition: 0`, `work: 1.5×`, `section: 3×`, `quote: 6×`) so dense regions stay readable.
  - Focus targeting via `focus` / `focusRadius` / `focusDuration` props, with multi-hop BFS expansion (cosmos.gl's neighbor lookup is single-hop only).
  - Ambient drift hook scaffolded but **not yet visibly working** at this version — parked behind edge-density work; consumers should treat ambient motion as a no-op for now.
