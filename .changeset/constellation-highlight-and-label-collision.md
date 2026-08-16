---
"@opencosmos/constellation": minor
---

Add `highlightedNodeIds` — bring a subset of nodes forward while the rest recede — and stop labels from piling up on each other.

**Highlighting.** `highlightedNodeIds` lights the named nodes (they brighten and swell) and dims everything else; `highlightPulse` breathes them rather than holding a fixed size, and auto-disables under `prefers-reduced-motion`. This is what a conversational surface drives: as a response cites passages, the corpus lights up along the path of the reasoning. Independent of `focus` — highlighting says what matters, focus says where the camera looks, and a chat typically highlights every citation but only moves the camera to the first.

Implemented as a colors-and-sizes pass, so it composes with `ambientDrift` (which owns positions) rather than fighting it. The full dim/restore sweep runs once per change of the highlighted set; per-frame work touches only the lit indices, so a three-node highlight costs three writes a frame regardless of corpus size.

**Label collision.** Labels are now culled when they would overlap one already placed, greedily in importance order (domain → tradition → synthesis → work → section → quote, then by degree) using a uniform grid. A dense cluster previously rendered as an unreadable pile of superimposed titles; it now resolves to the structural anchor that names it. `DEFAULT_LABEL_MIN_GAP_PX` is exported for corpora that want it looser or tighter.
