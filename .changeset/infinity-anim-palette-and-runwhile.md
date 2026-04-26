---
"@opencosmos/ui": minor
"@opencosmos/mcp": patch
---

`InfinityAnim`: add `palette` prop and smart `runWhile` pause/resume.

**New: `palette` prop** — six preset color combinations for the `dashes` technique:
- `'pink-blue'` (default; current behaviour)
- `'pink-pink'` / `'blue-blue'` / `'white-white'` — uniform single-color marks
- `'pink-white'` / `'blue-white'` — bright/soft mixed pairs

White uses `#FFFFFF`; pink and blue keep the existing brand hex values
(`#ec4899`, `#3b82f6`). Palette has no effect on the `stripes` technique,
which continues to use the gradient `colorTail` / `colorBody` / `colorHead`
props.

**New: `runWhile` prop** — smart pause/resume for the `dashes` technique.
When set to `false`, the orbit eases to a stop with a ~600ms time constant;
when set to `true`, it eases back up to full speed. When undefined (default),
the orbit runs continuously — backward-compatible with existing usage.

The dashes technique is now driven by a JS rAF loop with eased velocity
(instead of a CSS `@keyframes` `infinite` animation). This is what enables
mid-animation pause/resume without teleporting back to the start, and what
gives the velocity its natural ease-in/ease-out curve. The `paused` prop
(static still) and reduced-motion behaviour are unchanged.

**`ThinkingIndicator`** picks both up: new `markPalette` prop (default
`'pink-blue'`) is forwarded to the embedded mark, and the mark now orbits
only while a phrase is writing on, easing to a stop while the phrase is
settled, then resuming when the next phrase blooms in. Mirrors the previous
sparkle's "spin once per phrase change" feel but as continuous orbital
motion.

**MCP registry** — both components updated.
